
// dépendances
	
	const 	path = require('path'),
			spawn = require('child_process').spawn;
		
// module
	
	module.exports = function (Container) {
		
		"use strict";
		
		// attributes
			
			var that = this,
				childssockets = Container.get('childssockets'),
				websockets = Container.get('websockets');
				
		// methodes

			// private

				function _getClients() {

					var tabResult = Container.get('conf').get('clients').slice();

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
							Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
						}

					return tabResult;

				}

				function _getChilds() {

					var tabResult = Container.get('conf').get('childs').slice();

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
							Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
						}

					return tabResult;

				}

			// public

				this.isSocketClientAllowed = function (socketClient) {

					var bResult = false;

						try {

							for (var i = 0, clients = Container.get('conf').get('clients'); i < clients.length; ++i) {

								if (socketClient.token == clients[i].token) {
									bResult = clients[i].allowed;
									break;
								}

							}

						}
						catch (e) {
							Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
						}

					return bResult;

				};
				
				this.isSocketChiildAllowed = function (socketChild) {

					var bResult = false;

						try {

							for (var i = 0, childs = Container.get('conf').get('childs'); i < childs.length; ++i) {

								if (socketChild.token == childs[i].token) {
									bResult = childs[i].allowed;
									break;
								}

							}

						}
						catch (e) {
							Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
						}

					return bResult;

				};
				
				this.start = function () {

					return new Promise(function(resolve, reject) {

						try {

							if (Container.get('conf').has('pid')) {

								try {

									process.kill(Container.get('conf').get('pid'));
									Container.get('logs').success('[END PROCESS ' + Container.get('conf').get('pid') + ']');

								}
								catch (e) { }

							}

							Container.get('conf').set('pid', process.pid).save().then(function() {

								Container.get('logs').success('[START PROCESS ' + process.pid + ']');

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

										socket.removeAllListeners('user.update');

									}
									catch (e) {
										Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
									}

								})
								.onConnection(function(socket) {

									socket.token = socket.id;

									websockets	.setTokenToSocketById(socket.id, socket.id)
												.emit('clients', _getClients());
									
									socket.on('login', function (p_stData) {

										try {

											if (p_stData && p_stData.token) {

												var clients = Container.get('conf').get('clients'), currentClient = false;

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

													Container.get('conf').set('clients', clients);
													socket.emit('logged', currentClient);
													socket.emit('childs', _getChilds());
													websockets.emit('clients', _getClients());

												}

											}
											else if (p_stData && p_stData.login && p_stData.password) {

												var user = Container.get('conf').get('user'), clients, currentClient = false;

												if (user.login !== p_stData.login || user.password !== p_stData.password) {
													socket.emit('login.error', 'Le login ou le mot de passe est incorrect.');
												}
												else {

													currentClient = {
														allowed : true,
														token : socket.token,
														name : 'Nouveau client'
													};

													clients = Container.get('conf').get('clients');
													clients.push(currentClient);

													Container.get('conf').set('clients', clients).save().then(function() {

														socket.token = currentClient.token;

														websockets.fireLogin(socket, currentClient);

														socket.emit('logged', currentClient);
														socket.emit('childs', _getChilds());
														websockets.emit('clients', _getClients());

													})
													.catch(function(e) {
														Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
														socket.emit('login.error', 'Impossible de sauvegarder la configuration.');
													});

												}

											}
											else {
												socket.emit('login.error', "Vous n'avez fourni aucune donnée d'autorisation valide.");
											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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
												},
												clients = Container.get('conf').get('clients');

												clients.push(currentClient);

												Container.get('conf').set('clients', clients).save().then(function() {

													websockets.fireLogin(websockets.getSocket(p_stClient.token), currentClient);

													websockets	.emitTo(p_stClient.token, 'logged', currentClient)
																.emit('clients', _getClients());

												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('client.allow.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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

												var clients = Container.get('conf').get('clients');

												for (var i = 0; i < clients.length; ++i) {

													if (p_stClient.token === clients[i].token) {
														clients[i].name = p_stClient.name;
														break;
													}

												}

												Container.get('conf').set('clients', clients).save().then(function() {
													websockets.emit('clients', _getClients());
												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('client.rename.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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

												var clients = Container.get('conf').get('clients');

												for (var i = 0; i < clients.length; ++i) {

													if (p_stClient.token === clients[i].token) {
														clients.splice(i, 1);
														break;
													}

												}

												Container.get('conf').set('clients', clients).save().then(function() {

													websockets	.emitTo(p_stClient.token, 'client.deleted')
																.disconnect(p_stClient.token);

												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('client.delete.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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

												var childs = Container.get('conf').get('childs');
												childs.push(currentChild);

												Container.get('conf').set('childs', childs).save().then(function() {

													childssockets.fireLogin(childssockets.getSocket(p_stChild.token), currentChild);

													childssockets.emitTo(p_stChild.token, 'logged', currentChild);
													websockets.emit('childs', _getChilds());

												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('child.allow.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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

												var childs = Container.get('conf').get('childs');

												for (var i = 0; i < childs.length; ++i) {

													if (p_stChild.token === childs[i].token) {
														childs[i].name = p_stChild.name;
														break;
													}

												}

												Container.get('conf').set('childs', childs).save().then(function() {
													websockets.emit('childs', _getChilds());
												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('child.rename.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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

												var childs = Container.get('conf').get('childs');

												for (var i = 0; i < childs.length; ++i) {

													if (p_stChild.token === childs[i].token) {
														childs.splice(i, 1);
														break;
													}

												}

												Container.get('conf').set('childs', childs).save().then(function() {

													childssockets	.emitTo(p_stChild.token, 'child.deleted')
																	.disconnect(p_stChild.token);

													websockets.emit('childs', _getChilds());

												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('child.delete.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
											socket.emit('child.delete.error', "Impossible de suppprimer l'enfant.");
										}

									})

									/*// user

									.on('user.update', function (p_stData) {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('user.update.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}
											else if (!p_stData.login) {
												socket.emit('user.update.error', 'Login manquant.');
											}
											else if (!p_stData.password) {
												socket.emit('user.update.error', 'Mot de passe manquant.');
											}
											else {

												Container.get('conf').set('user', {
													login : p_stData.login,
													password : p_stData.password
												});

												Container.get('conf').save().then(function() {
													websockets.emit('user.updated');
												})
												.catch(function(e) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('user.update.error', 'Impossible de sauvegarder la configuration.');
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
											socket.emit('user.update.error', "Impossible de mettre à jour l'utilisateur.");
										}

									})*/

									// plugins

									.on('plugins', function() {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('plugins.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}
											else {
												socket.emit('plugins', Container.get('plugins').plugins);
											}

										}
										catch (e) {
											Container.get('logs').err('-- [plugins] ' + ((e.message) ? e.message : e));
											socket.emit('plugins.error', "Impossible de récupérer les plugins.");
										}

									})


									.on('plugin.add.github', function(url) {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('plugins.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}
											else {

												if (Container.get('conf').get('debug')) {
													Container.get('logs').log('plugin.add.github');
													Container.get('logs').log(url);
												}

												Container.get('plugins').addByGithub(url, Container).then(function() {
													socket.emit('plugins', Container.get('plugins').plugins);
												}).catch(function(err) {
													socket.emit('plugins.error', err);
													socket.emit('plugins', Container.get('plugins').plugins);
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [plugins] ' + ((e.message) ? e.message : e));
											socket.emit('plugins.error', "Impossible d'ajouter le plugin.");
										}

									})

									.on('plugin.delete', function(plugin) {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('plugins.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}
											else {

												if (Container.get('conf').get('debug')) {
													Container.get('logs').log('plugin.delete');
													Container.get('logs').log(plugin);
												}

												if (!plugin || !plugin.directory) {
													Container.get('logs').err('-- [plugins] : dossier de plugin inexistant.');
													socket.emit('plugins.error', "Impossible de suppprimer le plugin.");
												}
												else {

													Container.get('plugins').removeByDirectory(plugin.directory, Container).then(function() {
														socket.emit('plugins', Container.get('plugins').plugins);
													}).catch(function(err) {
														socket.emit('plugins.error', err);
														socket.emit('plugins', Container.get('plugins').plugins);
													});

												}

											}

										}
										catch (e) {
											Container.get('logs').err('-- [plugins] ' + ((e.message) ? e.message : e));
											socket.emit('plugins.error', "Impossible de suppprimer le plugin.");
										}

									})

									// actions

									.on('actions', function() {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('actions.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}
											else {
												socket.emit('actions', Container.get('conf').get('actions'));
											}

										}
										catch (e) {
											Container.get('logs').err('-- [actions] ' + ((e.message) ? e.message : e));
											socket.emit('actions.error', "Impossible de récupérer les actions.");
										}

									})
									.on('action.execute', function(action) {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('actions.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}

											else if (!action) {
												socket.emit('actions.error', "Aucune action n'a été fournie.");
											}
											else if (!action.name) {
												socket.emit('actions.error', "Le nom de l'action est manquant.");
											}
											else if (!action.child) {
												socket.emit('actions.error', "L'enfant conserné par l'action est manquant.");
											}
												else if (!action.child.token) {
													socket.emit('actions.error', "L'enfant conserné par l'action n'a pas de token.");
												}
											else if (!action.command) {
												socket.emit('actions.error', "La commande consernée par l'action est manquante.");
											}
											else if (!action.params) {
												Container.get('childssockets').emitTo(action.child.token, action.command);
											}
											else {
												Container.get('childssockets').emitTo(action.child.token, action.command, action.params);
											}

										}
										catch (e) {
											Container.get('logs').err('-- [actions] ' + ((e.message) ? e.message : e));
											socket.emit('actions.error', "Impossible d'exécuter cette action.");
										}

									})
									.on('action.add', function(action) {

										try {

											if (!that.isSocketClientAllowed(socket)) {
												socket.emit('actions.error', "Vous n'avez pas encore été autorisé à vous connecter à MIA.");
											}

											else if (!action) {
												socket.emit('actions.error', "Aucune action n'a été fournie.");
											}
											else if (!action.name) {
												socket.emit('actions.error', "Le nom de l'action est manquant.");
											}
											else if (!action.child) {
												socket.emit('actions.error', "L'enfant conserné par l'action est manquant.");
											}
												else if (!action.child.token) {
													socket.emit('actions.error', "L'enfant conserné par l'action n'a pas de token.");
												}
											else if (!action.command) {
												socket.emit('actions.error', "La commande consernée par l'action est manquante.");
											}

											else {

												var actions = Container.get('conf').get('actions');
												actions.push(action);
												Container.get('conf').set('actions', actions).save().then(function() {
													
												}).catch(function(err) {
													Container.get('logs').err('-- [actions] ' + ((err.message) ? err.message : err));
													socket.emit('actions.error', "Impossible de sauvegarder cette action.");
												});

											}

										}
										catch (e) {
											Container.get('logs').err('-- [actions] ' + ((e.message) ? e.message : e));
											socket.emit('actions.error', "Impossible d'exécuter cette action.");
										}

									});

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
										Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
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

												var childs = Container.get('conf').get('childs'), currentChild = false;

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

													Container.get('conf').set('childs', childs);
													socket.emit('logged', currentChild);
													websockets.emit('childs', _getChilds());

												}

											}
											else {

												socket.emit('login.error', "Vous n'avez fourni aucune donnée d'autorisation valide.");
												
											}

										}
										catch (e) {
											Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
											socket.emit('login.error', "Impossible de vous connecter.");
										}

									});

								})
								.onLog(function(socket) {

									socket.on('media.sound.error', function (error) {
										Container.get('logs').err('play sound - ' + error);
										websockets.emit('media.sound.error', error);
									})
									.on('media.sound.played', function (data) {
										Container.get('logs').log('media.sound.played');
										childssockets.emit('media.sound.played', data);
									})
									.on('media.sound.downloaded', function (data) {
										Container.get('logs').log('media.sound.downloaded');
										childssockets.emit('media.sound.downloaded', data);
									})

									.on('media.video.error', function (error) {
										Container.get('logs').err('play video - ' + error);
										childssockets.emit('media.video.error', error);
									})
									.on('media.video.played', function (data) {
										Container.get('logs').log('media.video.played');
										childssockets.emit('media.video.played', data);
									})
									.on('media.video.downloaded', function (data) {
										Container.get('logs').log('media.video.downloaded');
										childssockets.emit('media.video.downloaded', data);
									});

								});

								// run

									// plugins

									Container.get('plugins')
										.on('load', function (plugin) {
											Container.get('logs').success('-- [plugins] : ' + plugin.name + ' (v' + plugin.version + ') loaded');
										})
										.on('add', function (plugin) {
											Container.get('logs').success("-- [plugins] : '" + plugin.name + "' (v" + plugin.version + ')  added');
										})
										.on('error', function (err) {
											Container.get('logs').err('-- [plugins] : ' + err);
										})
									.loadAll(Container).then(function() {

										// server http

										Container.get('webserver').start().then(function() {

											// server http socket

											websockets.start().then(function() {

												// server childs
												
												childssockets.start().then(resolve).catch(reject);
													
											})
											.catch(reject);

										})
										.catch(reject);

									})
									.catch(reject);

							})
							.catch(reject);

						}
						catch (e) {
							reject((e.message) ? e.message : e);
						}

					});

				};
				
	};
	