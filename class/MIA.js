
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

				function _sendClients() {

					Container.get('status').getOneByCode('WAITING').then(function(waitingstatus) {

						Container.get('clients').getAll().then(function(clients) {

							try {

								clients.forEach(function (client, i) {
									clients[i].connected = false;
								});

								websockets.getSockets().forEach(function(socket) {

									var isClient = false;

									for (var i = 0; i < clients.length; ++i) {

										if (socket.token == clients[i].token) {
											clients[i].connected = true;
											isClient = true;
											break;
										}

									}

									if (!isClient) {

										clients.push({
											status : waitingstatus,
											connected : true,
											token : socket.token,
											name : 'Inconnu'
										});

									}

									websockets.emit('clients', clients);

								});

							}
							catch (e) {
								Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
							}

						})
						.catch(function(err) {
							err = (err.message) ? err.message : err;
							Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
						});

					})
					.catch(function(err) {
						err = (err.message) ? err.message : err;
						Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
					});

				}

				function _sendChilds() {

					Container.get('status').getOneByCode('WAITING').then(function(waitingstatus) {

						Container.get('childs').getAll().then(function(childs) {

							try {

								childs.forEach(function (client, i) {
									childs[i].connected = false;
								});

								childssockets.getSockets().forEach(function(socket) {

									var isChild = false;

									for (var i = 0; i < childs.length; ++i) {

										if (socket.token == childs[i].token) {
											childs[i].connected = true;
											isChild = true;
											break;
										}

									}

									if (!isChild) {

										childs.push({
											status : waitingstatus,
											connected : true,
											token : socket.token,
											name : 'Inconnu'
										});

									}

								});

								websockets.emit('childs', childs);

							}
							catch (e) {
								Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
							}

						})
						.catch(function(err) {
							err = (err.message) ? err.message : err;
							Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
						});

					})
					.catch(function(err) {
						err = (err.message) ? err.message : err;
						Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
					});

				}

			// public

				this.start = function () {

					return new Promise(function(resolve, reject) {

						try {

							// events

							websockets.onDisconnect(function(socket) {

								try {

									// conf

									_sendClients();

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

								websockets.setTokenToSocketById(socket.id, socket.id);

								_sendClients();
								_sendChilds();

								socket.on('login', function (p_stData) {

									try {

										if (p_stData && p_stData.token) {

											Container.get('clients').getAll().then(function(clients) {

												var currentClient = false;

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

													socket.emit('logged', currentClient);

													_sendChilds();
													_sendClients();

												}

											})
											.catch(function(err) {
												err = (err.message) ? err.message : err;
												Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
											});

										}
										else if (p_stData && p_stData.login && p_stData.password) {

											Container.get('users').exists(p_stData.login, p_stData.password).then(function(exists) {

												Container.get('users').lastInserted().then(function(user) {

													Container.get('status').getOneByCode('ACCEPTED').then(function(status) {

														Container.get('clients').add({
															user : user,
															status : status,
															token : socket.id,
															name : 'Nouveau client'
														}).then(function(currentClient) {

															socket.token = currentClient.token;

															websockets.fireLogin(socket, currentClient);

															socket.emit('logged', currentClient);

															_sendChilds();
															_sendClients();

														})
														.catch(function(err) {
															Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
															socket.emit('login.error', "Impossible de vous connecter.");
														});

													})
													.catch(function(err) {
														Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
														socket.emit('login.error', "Impossible de vous connecter.");
													});

												})
												.catch(function(err) {
													Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
													socket.emit('login.error', "Impossible de vous connecter.");
												});

											})
											.catch(function(err) {
												Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
												socket.emit('login.error', "Impossible de vous connecter.");
											});

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

								_sendClients();
								_sendChilds();

								socket.on('client.allow', function (p_stClient) {

									try {

										if (!p_stClient || !p_stClient.token) {
											socket.emit('client.allow.error', 'Les informations sur ce client sont incorrectes.');
										}
										else {

											Container.get('status').getOneByCode('ACCEPTED').then(function(status) {

												Container.get('users').lastInserted().then(function(user) {

													Container.get('clients').add({
														user : user,
														status : status,
														token : p_stClient.token,
														name : 'Nouveau client'
													}).then(function(currentClient) {

														websockets.fireLogin(websockets.getSocket(currentClient.token), currentClient);

														websockets.emitTo(currentClient.token, 'logged', currentClient);

														_sendClients();

													})
													.catch(function(err) {
														Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
														socket.emit('client.allow.error', "Impossible d'enregistrer cet enfant.");
													});

												})
												.catch(function(err) {
													Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
													socket.emit('client.allow.error', "Impossible d'enregistrer cet enfant.");
												});

											})
											.catch(function(err) {
												Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
												socket.emit('client.allow.error', "Impossible d'enregistrer cet enfant.");
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

										if (!p_stClient || !p_stClient.token || !p_stClient.name) {
											socket.emit('client.rename.error', 'Les informations sur ce client sont incorrectes.');
										}
										else {

											Container.get('clients').rename(p_stClient.token, p_stClient.name).then(_sendClients)
											.catch(function(err) {
												Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
												socket.emit('child.rename.error', 'Impossible de renommer ce client.');
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

										if (!p_stClient || !p_stClient.token) {
											socket.emit('client.delete.error', 'Les informations sur ce client sont incorrectes.');
										}
										else {

											Container.get('clients').delete(p_stClient.token).then(function() {
												
												childssockets	.emitTo(p_stClient.token, 'client.deleted')
																.disconnect(p_stClient.token);

												_sendClients();

											})
											.catch(function(e) {
												Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
												socket.emit('client.delete.error', 'Impossible de supprimer ce client.');
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

										if (!p_stChild || !p_stChild.token) {
											socket.emit('child.allow.error', 'Les informations sur cet enfant sont incorrectes.');
										}
										else {

											Container.get('status').getOneByCode('ACCEPTED').then(function(status) {

												Container.get('childs').add({
													status : status,
													token : p_stChild.token,
													name : 'Nouvel enfant'
												}).then(function(currentChild) {

													childssockets.fireLogin(childssockets.getSocket(currentChild.token), currentChild);

													childssockets.emitTo(currentChild.token, 'logged', currentChild);

													_sendChilds();

												})
												.catch(function(err) {
													Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
													socket.emit('child.allow.error', "Impossible d'autoriser cet enfant.");
												});

											})
											.catch(function(err) {
												Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
												socket.emit('child.allow.error', "Impossible d'autoriser cet enfant.");
											});

										}

									}
									catch (e) {
										Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
										socket.emit('child.allow.error', "Impossible d'autoriser cet enfant.");
									}

								})
								.on('child.rename', function (p_stChild) {

									try {

										if (!p_stChild || !p_stChild.token || !p_stChild.name) {
											socket.emit('child.rename.error', 'Les informations sur cet enfant sont incorrectes.');
										}
										else {

											Container.get('childs').rename(p_stChild.token, p_stChild.name).then(_sendChilds)
											.catch(function(e) {
												Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
												socket.emit('child.rename.error', 'Impossible de renommer cet enfant.');
											});

										}

									}
									catch (e) {
										Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
										socket.emit('child.rename.error', "Impossible de renommer cet enfant.");
									}

								})
								.on('child.delete', function (p_stChild) {

									try {

										if (!p_stChild || !p_stChild.token) {
											socket.emit('child.delete.error', 'Les informations sur cet enfant sont incorrectes.');
										}
										else {

											Container.get('childs').delete(p_stChild.token).then(function() {
												
												childssockets	.emitTo(p_stChild.token, 'child.deleted')
																.disconnect(p_stChild.token);

												_sendChilds();

											})
											.catch(function(e) {
												Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
												socket.emit('child.delete.error', 'Impossible de supprimer cet enfant.');
											});

										}

									}
									catch (e) {
										Container.get('logs').err('-- [MIA] ' + ((e.message) ? e.message : e));
										socket.emit('child.delete.error', "Impossible de suppprimer cet enfant.");
									}

								})

								/*// user

								.on('user.update', function (p_stData) {

									try {

										if (!p_stData.login) {
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

										socket.emit('plugins', Container.get('plugins').plugins);

									}
									catch (e) {
										Container.get('logs').err('-- [plugins] ' + ((e.message) ? e.message : e));
										socket.emit('plugins.error', "Impossible de récupérer les plugins.");
									}

								})


								.on('plugin.add.github', function(url) {

									try {

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
									catch (e) {
										Container.get('logs').err('-- [plugins] ' + ((e.message) ? e.message : e));
										socket.emit('plugins.error', "Impossible d'ajouter le plugin.");
									}

								})

								.on('plugin.delete', function(plugin) {

									try {

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
									catch (e) {
										Container.get('logs').err('-- [plugins] ' + ((e.message) ? e.message : e));
										socket.emit('plugins.error', "Impossible de suppprimer le plugin.");
									}

								})

								// actions

								.on('actions', function() {

									try {

										Container.get('actions').getAll().then(function(actions) {

											socket.emit('actions', actions);

										}).catch(function(err) {
											Container.get('logs').err('-- [actions] ' + ((err.message) ? err.message : err));
											socket.emit('actions.error', "Impossible de récupérer les actions.");
										});

									}
									catch (e) {
										Container.get('logs').err('-- [actions] ' + ((e.message) ? e.message : e));
										socket.emit('actions.error', "Impossible de récupérer les actions.");
									}

								})
								.on('action.execute', function(action) {

									try {

										if (!action) {
											socket.emit('actions.error', "Aucune action n'a été fournie.");
										}
										else if (!action.id) {
											socket.emit('actions.error', "L'id de l'action est manquant.");
										}
										else {

											Container.get('actions').getOneById(action.id).then(function(action) {

												if (!action.params) {
													Container.get('childssockets').emitTo(action.child.token, action.command);
												}
												else {
													Container.get('childssockets').emitTo(action.child.token, action.command, action.params);
												}

											})
											.catch(function(err) {
												Container.get('logs').err('-- [actions] ' + ((err.message) ? err.message : err));
												socket.emit('actions.error', "Impossible d'exécuter cette action.");
											});


										}

									}
									catch (e) {
										Container.get('logs').err('-- [actions] ' + ((e.message) ? e.message : e));
										socket.emit('actions.error', "Impossible d'exécuter cette action.");
									}

								})
								.on('action.add', function(action) {

									try {

										if (!action) {
											socket.emit('actions.error', "Aucune action n'a été fournie.");
										}
										else {

											Container.get('actions').add(action).then(function() {

												Container.get('actions').getAll().then(function(actions) {

													socket.emit('actions', actions);

												}).catch(function(err) {
													Container.get('logs').err('-- [actions] ' + ((err.message) ? err.message : err));
													socket.emit('actions.error', "Impossible de récupérer les actions.");
												});

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

								})

								// actionstypes

								.on('actionstypes', function() {

									try {

										Container.get('actionstypes').getAll().then(function(actionstypes) {

											socket.emit('actionstypes', actionstypes);

										}).catch(function(err) {
											Container.get('logs').err('-- [actionstypes] ' + ((err.message) ? err.message : err));
											socket.emit('actionstypes.error', "Impossible de récupérer les types d'action.");
										});

									}
									catch (e) {
										Container.get('logs').err('-- [actionstypes] ' + ((e.message) ? e.message : e));
										socket.emit('actionstypes.error', "Impossible de récupérer les types d'action.");
									}

								});

							});

							childssockets.onDisconnect(function(socket) {

								try {

									// conf

									_sendChilds();

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
								_sendChilds();
								
								// childs

								socket.on('login', function (p_stData) {

									try {

										if (p_stData && p_stData.token) {

											Container.get('childs').getAll().then(function(childs) {

												var currentChild = false;

												for (var i = 0; i < childs.length; ++i) {

													if (p_stData.token === childs[i].token) {
														currentChild = childs[i];
														break;
													}

												}

												if (!currentChild) {
													socket.emit('login.error', "Cet enfant n'existe pas ou n'a pas encore été autorisé.");
												}
												else {

													socket.token = currentChild.token;

													childssockets.fireLogin(socket, currentChild);

													socket.emit('logged', currentChild);
													_sendChilds();

												}

											})
											.catch(function(err) {
												Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err));
												socket.emit('login.error', "Impossible de vous connecter.");
											});

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

						}
						catch (e) {
							reject((e.message) ? e.message : e);
						}

					});

				};
				
	};
	