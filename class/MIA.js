
// dépendances
	
	var

		path = require('path'),
		q = require('q'),

		Container = require(path.join(__dirname, 'Container.js')),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {
		
		"use strict";
		
		// attributes
			
			var
				conf = Container.get('conf'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs'));
				
		// methodes

			// private

				function _isSocketAllowed(socket) {
					return (socket.token && socket.allowed);
				}

			// public

				this.start = function () {

					var deferred = q.defer();

						try {

							if (!conf.initialized()) {

								conf.set('webport', 1337)
									.set('childrenport', 1338)
									.set('debug', false)
									.set('ssl', false)
									.set('user', {
										login : 'rasp',
										password : 'password'
									})
									.set('pid', -1)
									.set('clients', [])
									.set('childs', [])

									.save();

							}

							conf.load().then(function() {

								var bOtherInstanceRunning = true;

								if (-1 >= conf.get('pid')) {
									bOtherInstanceRunning = false;
								}
								else {

									try {

										process.kill(conf.get('pid'));
										m_clLog.log('[END ' + conf.get('pid') + ']');

									}
									catch (e) { }

									bOtherInstanceRunning = false;

								}

								if (!bOtherInstanceRunning) {

									conf.set('pid', process.pid).save().then(function() {

										m_clLog.log('[START ' + process.pid + ']');

										// events

										Container.get('server.socket.web').onDisconnect(function(socket) {

											// conf

											var clients = conf.get('clients');

											clients.forEach(function(client, key) {

												if (socket.token === client.token) {
													clients[key].connected = false;
												}

											});

											conf.set('clients', clients);
											Container.get('server.socket.web').emit('web.clients', clients);

											// listeners

											socket.removeAllListeners('web.childs');
											socket.removeAllListeners('web.clients');

											socket.removeAllListeners('web.user.update');
											socket.removeAllListeners('web.login');

										})
										.onConnection(function(socket) {

											socket

												.on('web.childs', function () {
													socket.emit('web.childs', conf.get('childs'));
												})
												.on('web.clients', function () {
													socket.emit('web.clients', conf.get('clients'));
												})

												.on('web.user.update', function (p_stData) {

													if (!_isSocketAllowed(socket)) {
														socket.emit('web.user.update.error', "Vous n'avez pas été autorisé à vous connecter.");
													}
													else if (!p_stData.login) {
														socket.emit('web.user.update.error', 'Login manquant.');
													}
													else if (!p_stData.password) {
														socket.emit('web.user.update.error', 'Mot de passe manquant.');
													}
													else {

														conf.set('user', {
															login : p_stData.login,
															password : p_stData.password
														});

														conf.save().then(function() {
															Container.get('server.socket.web').emit('web.user.updated');
														})
														.catch(function(e) {
															m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
															socket.emit('web.user.update.error', 'Impossible de sauvegarder la configuration.');
														});

													}

												})

												.on('web.user.login', function (p_stData) {

													var clients = conf.get('clients');

													if (p_stData.login && p_stData.password) {

														var user = conf.get('user');

														if (user.login === p_stData.login && user.password === p_stData.password) {
															socket.emit('web.user.login.error', 'Le login ou le mot de passe est incorrect.');
														}
														else {

															var client = {
																allowed : true,
																connected : true,
																token : socket.id,
																name : socket.id
															};

															clients.push(client)
															conf.set('clients', clients);

															conf.save().then(function() {
																socket.emit('web.user.logged', client);
																Container.get('server.socket.web').emit('web.clients', clients);
															})
															.catch(function(e) {
																m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
																socket.emit('web.mainuser.update.error', 'Impossible de sauvegarder la configuration.');
															});

														}

													}
													else if (p_stData.token) {

														var currentClient = false;

														clients.forEach(function(client, key) {

															if (p_stData.token === client.token && client.allowed) {
																clients[key].connected = true;
																socket.token = p_stData.token;
																currentClient = client;
															}

														});

														if (!currentClient) {
															socket.emit('web.user.login.error', "Ce client n'existe pas ou n'a pas été autorisé.");
														}
														else {

															conf.set('clients', clients);

															socket.emit('web.user.logged', currentClient);
															Container.get('server.socket.web').emit('web.clients', clients);

														}

													}
													else {
														socket.emit('web.user.login.error', "Vous n'avez envoyé aucune donnée de connexion valide.");
													}

												});

										});

										Container.get('server.socket.child')
											.onDisconnect(function(socket) {
												Container.get('server.socket.web').emit('web.disconnected', socket.MIA);
											})
											.onConnection(function(socket) {
												Container.get('server.socket.web').emit('web.connection', socket.MIA);
											});

										// run

											// server http

											Container.get('server.http').start().then(function() {

												// server http socket

												Container.get('server.socket.web').start().then(function() {

													// server childs
													
													Container.get('server.socket.child').start().then(function() {

														// plugins

														Container.get('plugins').getData().then(function(p_tabData) {

															p_tabData.forEach(function(p_stPlugin) {

																try {
																	require(p_stPlugin.main)(Container);
																	m_clLog.success('-- [plugin] ' + p_stPlugin.name + ' loaded');
																}
																catch (e) {
																	m_clLog.err((e.message) ? e.message : e);
																}

															});

														})
														.catch(deferred.reject);

														deferred.resolve();
											
													})
													.catch(deferred.reject);
														
												})
												.catch(deferred.reject);

											})
											.catch(deferred.reject);

									})
									.catch(function(e) {
										deferred.reject('-- [conf] ' + ((e.message) ? e.message : e));
									});
								}

							})
							.catch(deferred.reject);

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
	};
	