
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

			// private

				function _getClients() {

					var tabResult = conf.get('clients').slice();

						try {

							tabResult.forEach(function (client, i) {
								tabResult[i].connected = false;
							});

							websockets.getSockets().forEach(function(socket) {

								var isClient = false;

								for (var i = 0; i < tabResult.length; ++i) {

									if (socket.token == tabResult[i].token) {
										tabResult[i].connected = true;
										isClient = true;
										break;
									}

								}

								if (!isClient) {

									tabResult.push({
										allowed : false,
										connected : true,
										token : socket.token,
										name : 'Inconnu'
									});

								}

							});

						}
						catch (e) {
							m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
						}

					return tabResult;

				}

			// public

				this.isSocketClientAllowed = function (socketClient) {

					var bResult = false;

						try {

							for (var i = 0, clients = conf.get('clients'); i < clients.length; ++i) {

								if (socketClient.token == clients[i].token) {
									bResult = clients[i].allowed;
									break;
								}

							}

						}
						catch (e) {
							m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
						}

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

								var bOtherInstanceRunning = true, nPreviousPID = conf.get('pid');

								if (-1 >= nPreviousPID) {
									bOtherInstanceRunning = false;
								}
								else {

									try {

										process.kill(nPreviousPID);
										m_clLog.log('[END ' + nPreviousPID + ']');

									}
									catch (e) { }

									bOtherInstanceRunning = false;

								}

								if (!bOtherInstanceRunning) {

									conf.set('pid', process.pid).save().then(function() {

										m_clLog.log('[START ' + process.pid + ']');

										// events

										websockets.onDisconnect(function(socket) {

											try {

												// conf

												websockets.emit('web.clients', _getClients());

												// listeners

												socket.removeAllListeners('web.user.update');
												socket.removeAllListeners('web.user.login');

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
											}

										})
										.onConnection(function(socket) {

											try {

												socket.token = socket.id;
												websockets.setTokenToSocketById(socket.id, socket.id);
												websockets.emit('web.clients', _getClients());
												
												// clients

												socket.on('web.clients.allow', function (p_stClient) {

													try {

														if (!that.isSocketClientAllowed(socket)) {
															socket.emit('web.clients.allow.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
														}
														else if (!p_stClient || !p_stClient.token) {
															socket.emit('web.clients.allow.error', 'Les informations sur ce client sont incorrectes.');
														}
														else {

															var currentClient = {
																allowed : true,
																token : p_stClient.token,
																name : 'Nouveau client'
															};

															conf.addTo('clients', currentClient).save().then(function() {

																websockets.emitTo(p_stClient.token, 'web.user.logged', currentClient);
																websockets.emit('web.clients', _getClients());

															})
															.catch(function(e) {
																m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
																socket.emit('web.clients.allow.error', 'Impossible de sauvegarder la configuration.');
															});

														}

													}
													catch (e) {
														m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
														socket.emit('web.clients.allow.error', "Impossible d'autoriser le client'.");
													}

												})

												.on('web.clients.delete', function (p_stClient) {

													try {

														if (!that.isSocketClientAllowed(socket)) {
															socket.emit('web.clients.delete.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
														}
														else if (!p_stClient || !p_stClient.token) {
															socket.emit('web.clients.delete.error', 'Les informations sur ce client sont incorrectes.');
														}
														else {

															var clients = conf.get('clients');

															clients.forEach(function(client, key) {

																if (p_stClient.token === client.token) {
																	clients.splice(key, 1);
																}

															});

															for (var i = 0; i < clients.length; ++i) {

																if (p_stClient.token === clients[i].token) {
																	clients.splice(i, 1);
																	break;
																}

															}

															conf.set('clients', clients).save().then(function() {
																websockets.emitTo(p_stClient.token, 'web.user.deleted');
																websockets.disconnect(p_stClient.token);
															})
															.catch(function(e) {
																m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
																socket.emit('web.clients.delete.error', 'Impossible de sauvegarder la configuration.');
															});

														}

													}
													catch (e) {
														m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
														socket.emit('web.clients.delete.error', "Impossible de suppprimer le client.");
													}

												})

												// user

												.on('web.user.update', function (p_stData) {

													try {

														if (!that.isSocketClientAllowed(socket)) {
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

													}
													catch (e) {
														m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
														socket.emit('web.user.update.error', "Impossible de mettre à jour l'utilisateur.");
													}

												})

												.on('web.user.login', function (p_stData) {

													try {

														if (p_stData && p_stData.token) {

															var clients = conf.get('clients'), currentClient = false;

															for (var i = 0; i < clients.length; ++i) {

																if (p_stData.token === clients[i].token) {
																	currentClient = clients[i];
																	break;
																}

															}

															if (!currentClient) {
																socket.emit('web.user.login.error', "Ce client n'existe pas ou n'a pas encore été autorisé.");
															}
															else {

																socket.token = currentClient.token;

																conf.set('clients', clients);
																socket.emit('web.user.logged', currentClient);
																websockets.emit('web.clients', _getClients());

															}

														}
														else if (p_stData && p_stData.login && p_stData.password) {

															var user = conf.get('user'), currentClient = false;

															if (user.login === p_stData.login && user.password === p_stData.password) {
																socket.emit('web.user.login.error', 'Le login ou le mot de passe est incorrect.');
															}
															else {

																currentClient = {
																	allowed : true,
																	token : socket.token,
																	name : 'Nouveau client'
																};

																conf.addTo('clients', currentClient).save().then(function() {

																	socket.token = currentClient.token;

																	socket.emit('web.user.logged', currentClient);
																	websockets.emit('web.clients', _getClients());

																})
																.catch(function(e) {
																	m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
																	socket.emit('web.user.login.error', 'Impossible de sauvegarder la configuration.');
																});

															}

														}
														else {

															socket.emit('web.user.login.error', "Vous n'avez fourni aucune donnée d'autorisation valide.");
															
														}

													}
													catch (e) {
														m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
														socket.emit('web.user.login.error', "Impossible de vous connecter.");
													}

												});

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
											}

										});

										childssockets.onDisconnect(function(socket) {

											// conf

											websockets.emit('web.childs', conf.get('childs'));

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
	