
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

				function _getChilds() {

					var tabResult = conf.get('childs').slice();

						try {

							tabResult.forEach(function (client, i) {
								tabResult[i].connected = false;
							});

							childssockets.getSockets().forEach(function(socket) {

								var isChild = false;

								for (var i = 0; i < tabResult.length; ++i) {

									if (socket.token == tabResult[i].token) {
										tabResult[i].connected = true;
										isChild = true;
										break;
									}

								}

								if (!isChild) {

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
				
				this.isSocketChiildAllowed = function (socketChild) {

					var bResult = false;

						try {

							for (var i = 0, childs = conf.get('childs'); i < childs.length; ++i) {

								if (socketChild.token == childs[i].token) {
									bResult = childs[i].allowed;
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

								var nPreviousPID = conf.get('pid');

								if (-1 < nPreviousPID) {

									try {

										process.kill(nPreviousPID);
										m_clLog.success('[END PROCESS ' + nPreviousPID + ']');

									}
									catch (e) { }

								}

								conf.set('pid', process.pid).save().then(function() {

									m_clLog.success('[START PROCESS ' + process.pid + ']');

									// events

									websockets.onDisconnect(function(socket) {

										try {

											// conf

											websockets.emit('clients', _getClients());

											// listeners

											socket.removeAllListeners('client.allow');
											socket.removeAllListeners('client.delete');
											socket.removeAllListeners('login');
											
											socket.removeAllListeners('child.allow');
											socket.removeAllListeners('child.delete');

											// socket.removeAllListeners('web.user.update');

										}
										catch (e) {
											m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
										}

									})
									.onConnection(function(socket) {

										socket.token = socket.id;

										websockets	.setTokenToSocketById(socket.id, socket.id)
													.emit('clients', _getClients());
										
										socket.on('login', function (p_stData) {

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
														socket.emit('login.error', "Ce client n'existe pas ou n'a pas encore été autorisé.");
													}
													else {

														socket.token = currentClient.token;

														websockets.fireLogin(socket, currentClient);

														conf.set('clients', clients);
														socket.emit('logged', currentClient);
														socket.emit('childs', _getChilds());
														websockets.emit('clients', _getClients());

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

															websockets.fireLogin(socket, currentClient);

															socket.emit('logged', currentClient);
															socket.emit('childs', _getChilds());
															websockets.emit('clients', _getClients());

														})
														.catch(function(e) {
															m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
															socket.emit('login.error', 'Impossible de sauvegarder la configuration.');
														});

													}

												}
												else {

													socket.emit('login.error', "Vous n'avez fourni aucune donnée d'autorisation valide.");
													
												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('login.error', "Impossible de vous connecter.");
											}

										})

									})

									.onLog(function(socket) {

										socket.on('client.allow', function (p_stClient) {

											try {

												if (!that.isSocketClientAllowed(socket)) {
													socket.emit('client.allow.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stClient || !p_stClient.token) {
													socket.emit('client.allow.error', 'Les informations sur ce client sont incorrectes.');
												}
												else {

													var currentClient = {
														allowed : true,
														token : p_stClient.token,
														name : 'Nouveau client'
													};

													conf.addTo('clients', currentClient).save().then(function() {

														websockets.fireLogin(websockets.getSocket(p_stClient.token), currentClient);

														websockets	.emitTo(p_stClient.token, 'logged', currentClient)
																	.emit('clients', _getClients());

													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('client.allow.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('client.allow.error', "Impossible d'autoriser le client'.");
											}

										})
										.on('client.rename', function (p_stClient) {

											try {

												if (!that.isSocketClientAllowed(socket)) {
													socket.emit('client.rename.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stClient || !p_stClient.token || !p_stClient.name) {
													socket.emit('client.rename.error', 'Les informations sur ce client sont incorrectes.');
												}
												else {

													var clients = conf.get('clients');

													for (var i = 0; i < clients.length; ++i) {

														if (p_stClient.token === clients[i].token) {
															clients[i].name = p_stClient.name;
															break;
														}

													}

													conf.set('clients', clients).save().then(function() {
														websockets.emit('clients', _getClients());
													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('client.rename.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('client.rename.error', "Impossible d'autoriser le client'.");
											}

										})
										.on('client.delete', function (p_stClient) {

											try {

												if (!that.isSocketClientAllowed(socket)) {
													socket.emit('client.delete.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stClient || !p_stClient.token) {
													socket.emit('client.delete.error', 'Les informations sur ce client sont incorrectes.');
												}
												else {

													var clients = conf.get('clients');

													for (var i = 0; i < clients.length; ++i) {

														if (p_stClient.token === clients[i].token) {
															clients.splice(i, 1);
															break;
														}

													}

													conf.set('clients', clients).save().then(function() {

														websockets	.emitTo(p_stClient.token, 'client.deleted')
																	.disconnect(p_stClient.token);

													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('client.delete.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('client.delete.error', "Impossible de suppprimer le client.");
											}

										})

										// childs

										.on('child.allow', function (p_stChild) {

											try {

												if (!that.isSocketClientAllowed(socket)) {
													socket.emit('child.allow.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stChild || !p_stChild.token) {
													socket.emit('child.allow.error', 'Les informations sur cet enfant sont incorrectes.');
												}
												else {

													var currentChild = {
														allowed : true,
														token : p_stChild.token,
														name : 'Nouvel enfant'
													};

													conf.addTo('childs', currentChild).save().then(function() {

														childssockets.fireLogin(childssockets.getSocket(p_stChild.token), currentChild);

														childssockets.emitTo(p_stChild.token, 'logged', currentChild);
														websockets.emit('childs', _getChilds());

													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('child.allow.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('child.allow.error', "Impossible d'autoriser l'enfant.");
											}

										})
										.on('child.rename', function (p_stChild) {

											try {

												if (!that.isSocketClientAllowed(socket)) {
													socket.emit('child.rename.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stChild || !p_stChild.token || !p_stChild.name) {
													socket.emit('child.rename.error', 'Les informations sur cet enfant sont incorrectes.');
												}
												else {

													var childs = conf.get('childs');

													for (var i = 0; i < childs.length; ++i) {

														if (p_stChild.token === childs[i].token) {
															childs[i].name = p_stChild.name;
															break;
														}

													}

													conf.set('childs', childs).save().then(function() {
														websockets.emit('childs', _getChilds());
													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('child.rename.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('child.rename.error', "Impossible d'autoriser l'enfant.");
											}

										})
										.on('child.delete', function (p_stChild) {

											try {

												if (!that.isSocketClientAllowed(socket)) {
													socket.emit('child.delete.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
												}
												else if (!p_stChild || !p_stChild.token) {
													socket.emit('child.delete.error', 'Les informations sur cet enfant sont incorrectes.');
												}
												else {

													var childs = conf.get('childs');

													for (var i = 0; i < childs.length; ++i) {

														if (p_stChild.token === childs[i].token) {
															childs.splice(i, 1);
															break;
														}

													}

													conf.set('childs', childs).save().then(function() {

														childssockets	.emitTo(p_stChild.token, 'child.deleted')
																		.disconnect(p_stChild.token);

														websockets.emit('childs', _getChilds());

													})
													.catch(function(e) {
														m_clLog.err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('child.delete.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('child.delete.error', "Impossible de suppprimer l'enfant.");
											}

										})

										/*// user

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

										})*/;

									});

									childssockets.onDisconnect(function(socket) {

										try {

											// conf

											websockets.emit('childs', _getChilds());

											// listeners

												// login

												socket.removeAllListeners('login');

												// media

												socket.removeAllListeners('media.sound.error');
												socket.removeAllListeners('media.sound.played');
												socket.removeAllListeners('media.sound.downloaded');

												socket.removeAllListeners('media.video.error');
												socket.removeAllListeners('media.video.played');
												socket.removeAllListeners('media.video.downloaded');

										}
										catch (e) {
											m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
										}

									})
									.onConnection(function(socket) {

										socket.token = socket.id;
										childssockets.setTokenToSocketById(socket.id, socket.id);
										websockets.emit('childs', _getChilds());
										
										// childs

										socket.on('login', function (p_stData) {

											try {

												if (p_stData && p_stData.token) {

													var childs = conf.get('childs'), currentChild = false;

													for (var i = 0; i < childs.length; ++i) {

														if (p_stData.token === childs[i].token) {
															currentChild = childs[i];
															break;
														}

													}

													if (!currentChild) {
														socket.emit('login.error', "Cet enfat n'existe pas ou n'a pas encore été autorisé.");
													}
													else {

														socket.token = currentChild.token;

														childssockets.fireLogin(socket, currentChild);

														conf.set('childs', childs);
														socket.emit('logged', currentChild);
														websockets.emit('childs', _getChilds());

													}

												}
												else {

													socket.emit('login.error', "Vous n'avez fourni aucune donnée d'autorisation valide.");
													
												}

											}
											catch (e) {
												m_clLog.err('-- [MIA] ' + ((e.message) ? e.message : e));
												socket.emit('login.error', "Impossible de vous connecter.");
											}

										});

									})
									.onLog(function(socket) {

										socket.on('media.sound.error', function (error) {
											m_clLog.err('play sound - ' + error);
											Container.get('server.socket.web').emit('media.sound.error', error);
										})
										.on('media.sound.played', function (data) {
											m_clLog.log('media.sound.played');
											Container.get('server.socket.child').emit('media.sound.played', data);
										})
										.on('media.sound.downloaded', function (data) {
											m_clLog.log('media.sound.downloaded');
											Container.get('server.socket.child').emit('media.sound.downloaded', data);
										})

										.on('media.video.error', function (error) {
											m_clLog.err('play video - ' + error);
											Container.get('server.socket.child').emit('media.video.error', error);
										})
										.on('media.video.played', function (data) {
											m_clLog.log('media.video.played');
											Container.get('server.socket.child').emit('media.video.played', data);
										})
										.on('media.video.downloaded', function (data) {
											m_clLog.log('media.video.downloaded');
											Container.get('server.socket.child').emit('media.video.downloaded', data);
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

							})
							.catch(deferred.reject);

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
	};
	