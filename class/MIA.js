
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
				m_clLog = new Logs(path.join(__dirname, '..', 'logs')),
				m_stSIKYUser;
				
		// methodes

			// public

				this.start = function () {

					var deferred = q.defer();

						try {

							// events

								Container.get('server.socket.web')
									.onDisconnect(function(socket) {

										socket.removeAllListeners('web.childs');
										socket.removeAllListeners('web.clients');

										socket.removeAllListeners('web.login');
										socket.removeAllListeners('web.mainuser.creation');

										m_stSIKYUser.clients.forEach(function(client, key) {

											if (socket.token === client.token) {
												m_stSIKYUser.clients[key].connected = false;
											}

										});

										Container.get('server.socket.web').emit('web.clients', m_stSIKYUser.clients);

									})
									.onConnection(function(socket) {

										socket

											.on('web.childs', function () {
												socket.emit('web.childs', Container.get('server.socket.child').getConnectedChilds());
											})
											.on('web.clients', function () {
												socket.emit('web.clients', m_stSIKYUser.clients);
											})

											.on('web.mainuser.creation', function (p_stData) {
												
												if (m_stSIKYUser) {
													Container.get('server.socket.web').emit('web.mainuser.created');
												}
												else {

													if (!p_stData.login) {
														socket.emit('web.mainuser.creation.error', 'Login manquant.');
													}
													else if (!p_stData.password) {
														socket.emit('web.mainuser.creation.error', 'Mot de passe manquant.');
													}
													else {

														m_stSIKYUser = {
															login : p_stData.login,
															password : p_stData.password,
															clients : []
														};

														Container.get('server.socket.web').emit('web.mainuser.created');

													}

												}

											})

											.on('web.login', function (p_stData) {

												if (m_stSIKYUser) {

													if (p_stData.login && p_stData.password) {

														if (m_stSIKYUser.login == p_stData.login && m_stSIKYUser.password == p_stData.password) {
															socket.emit('web.login.error', 'Le login ou le mot de passe est incorrect.');
														}
														else {

															var client = {
																connected : true,
																token : socket.id
															};

															m_stSIKYUser.clients.push(client);

															socket.emit('web.logged', client);
															Container.get('server.socket.web').emit('web.clients', m_stSIKYUser.clients);

														}

													}
													else if (p_stData.token) {

														var currentClient = false;

														m_stSIKYUser.clients.forEach(function(client, key) {

															if (p_stData.token === client.token) {
																m_stSIKYUser.clients[key].connected = true;
																socket.token = p_stData.token;
																currentClient = client;
															}

														});

														if (!currentClient) {
															socket.emit('web.login.error', 'Ce client n\'a pas été validé.');
														}
														else {
															socket.emit('web.logged', currentClient);
															Container.get('server.socket.web').emit('web.clients', m_stSIKYUser.clients);
														}

													}
													else {
														socket.emit('web.login.error', 'Vous n\'avez envoyé aucune donnée de connexion valide.');
													}

												}

												else {
													socket.emit('web.user.creation');
												}

											});

										if (!m_stSIKYUser) {
											socket.emit('web.user.creation');
										}
										else {
											socket.emit('web.mainuser.created');
										}

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

								Container.get('server.http').start()
									.then(function() {

										// server http socket

										Container.get('server.socket.web').start()
											.then(function() {

												// server childs
												
												Container.get('server.socket.child').start()
													.then(function() {

														// plugins

														Container.get('plugins').getData()
															.then(function(p_tabData) {

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
							
						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
				this.stop = function () {

					var deferred = q.defer();

						try {

							Container.get('server.socket.child').stop()
								.then(function () {
									
									Container.get('server.socket.web').stop()
										.then(function () {
											
											Container.get('server.http').stop()
												.then(deferred.resolve)
												.catch(deferred.reject);
											
										})
										.catch(deferred.reject);

								})
								.catch(deferred.reject);
								
						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
	};
	