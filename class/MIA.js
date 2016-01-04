
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
				that = this,
				conf = Container.get('conf'),
				websockets = Container.get('server.socket.web'),
				childssockets = Container.get('server.socket.child'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs'));
				
		// methodes

			// public

				this.isClientAllowed = function (token) {

					var bResult = false;

						conf.get('clients').forEach(function(client) {

							if (token === client.token) {
								bResult = client.allowed;
							}

						});

					return bResult;

				};
				
				this.isChildAllowed = function (token) {

					var bResult = false;

						conf.get('childs').forEach(function(child) {

							if (token === child.token) {
								bResult = child.allowed;
							}

						});

					return bResult;

				};

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

										websockets.onDisconnect(function(socket) {

											// conf

											var clients = conf.get('clients');

											if (socket.MIA && socket.MIA.token) {

												clients.forEach(function(client, key) {

													if (socket.MIA.token === client.token) {
														clients[key].connected = false;
													}

												});

												conf.set('clients', clients);
												websockets.emit('web.clients', clients);

											}

											// listeners

											socket.removeAllListeners('web.childs');
											socket.removeAllListeners('web.clients');

											socket.removeAllListeners('web.user.update');
											socket.removeAllListeners('web.user.login');

										})
										.onConnection(function(socket) {

											// childs

											socket.on('web.childs', function () {
												socket.emit('web.childs', conf.get('childs'));
											})

											// clients

											.on('web.clients.allow', function (p_stClient) {

												var clients = conf.get('clients');

												if (!that.isClientAllowed(socket.MIA.token)) {
													socket.emit('web.clients.allow.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stClient || !p_stClient.token) {
													socket.emit('web.clients.allow.error', 'Les informations sur ce client sont incorrectes.');
												}
												else {

													clients.forEach(function(client, key) {

														if (p_stClient.token === client.token) {
															clients[key].allowed = true;
															clients[key].name = 'Autorisé';
														}

													});

													conf.set('clients', clients).save().then(function() {
														websockets.emit('web.clients', clients);
													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('web.clients.allow.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											})

											.on('web.clients.delete', function (p_stClient) {

												var clients = conf.get('clients');

												if (!that.isClientAllowed(socket.MIA.token)) {
													socket.emit('web.clients.delete.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stClient || !p_stClient.token) {
													socket.emit('web.clients.delete.error', 'Les informations sur ce client sont incorrectes.');
												}
												else {

													clients.forEach(function(client, key) {

														if (p_stClient.token === client.token) {
															clients.splice(key, 1);
														}

													});

													conf.set('clients', clients).save().then(function() {
														websockets.emit('web.clients', clients);
													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('web.clients.delete.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											})

											.on('web.clients', function () {
												socket.emit('web.clients', conf.get('clients'));
											})

											// user

											.on('web.user.update', function (p_stData) {

												if (!that.isClientAllowed(socket.MIA.token)) {
													socket.emit('web.user.update.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
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
														websockets.emit('web.user.updated');
													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('web.user.update.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											})

											.on('web.user.login', function (p_stData) {

												var clients = conf.get('clients'), currentClient = false;

												if (p_stData && p_stData.token) {

													clients.forEach(function(client, key) {

														if (p_stData.token === client.token && client.allowed) {

															clients[key].connected = true;
															clients[key].allowed = true;

															socket.MIA = {
																token : p_stData.token
															};

															currentClient = client;

														}

													});

													if (!currentClient) {
														socket.emit('web.user.login.error', "Ce client n'existe pas ou n'a pas encore été autorisé.");
													}
													else {

														conf.set('clients', clients);
														socket.emit('web.user.logged', currentClient);
														websockets.emit('web.clients', conf.get('clients'));

													}

												}
												else if (p_stData && p_stData.login && p_stData.password) {

													var user = conf.get('user');

													if (user.login === p_stData.login && user.password === p_stData.password) {
														socket.emit('web.user.login.error', 'Le login ou le mot de passe est incorrect.');
													}
													else {

														currentClient = {
															allowed : true,
															connected : true,
															token : socket.id,
															name : socket.id
														};

														socket.MIA = {
															token : socket.id
														};

														clients.push(currentClient)
														conf.set('clients', clients);

														conf.save().then(function() {
															socket.emit('web.user.logged', currentClient);
															websockets.emit('web.clients', conf.get('clients'));
														})
														.catch(function(e) {
															m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
															socket.emit('web.user.login.error', 'Impossible de sauvegarder la configuration.');
														});

													}

												}
												else {
													
													currentClient = {
														allowed : false,
														connected : true,
														token : socket.id,
														name : "En attente d'autorisation"
													};

													socket.MIA = {
														token : socket.id
													};

													clients.push(currentClient)
													conf.set('clients', clients);

													conf.save().then(function() {
														socket.emit('web.user.login.waitvalidation', currentClient);
														websockets.emit('web.clients', conf.get('clients'));
													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('web.user.login.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											});

										});

										childssockets.onDisconnect(function(socket) {

											// conf

											var childs = conf.get('childs');

											childs.forEach(function(child, key) {

												if (socket.token === child.token) {
													childs[key].connected = false;
												}

											});

											conf.set('childs', childs);
											websockets.emit('web.childs', childs);

											// listeners

											socket.removeAllListeners('child.login');

										})
										.onConnection(function(socket) {

											socket.on('child.login', function (p_stData) {

												var childs = conf.get('childs');

												if (p_stData.token) {

													var currentChild = false;

													childs.forEach(function(child, key) {

														if (p_stData.token === child.token && child.allowed) {
															childs[key].connected = true;
															socket.token = p_stData.token;
															currentChild = child;
														}

													});

													if (!currentChild) {
														socket.emit('child.login.error', "Cet enfant n'existe pas ou n'a pas été autorisé.");
													}
													else {

														conf.set('childs', childs);

														socket.emit('child.logged', currentChild);
														websockets.emit('web.childs', childs);

													}

												}
												else {
													socket.emit('child.login.error', "Vous n'avez envoyé aucune donnée de connexion valide.");
												}

											});

										});

										// run

											// server http

											Container.get('server.http').start().then(function() {

												// server http socket

												websockets.start().then(function() {

													// server childs
													
													childssockets.start().then(function() {

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
	