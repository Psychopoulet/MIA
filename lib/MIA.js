
"use strict";

// deps
	
	const cronjob = require("cron").CronJob;

// private

	// methods

		function _runCron (that, cron) {

			try {

				cron.job = new cronjob(cron.timer, () => {

					that.container.get("actions").getAllByCron(cron).then((actions) => {

						actions.forEach((action) => {
							that.container.get("actions").execute(action.type.command, action);
						});

					}).catch((err) => {
						that.container.get("logs").err("-- [crons] : " + err);
					});

				}, null, true);

			}
			catch(e) {
				that.container.get("logs").err("-- [crons] : " + ((e.message) ? e.message : e));
			}

		}

		function _classicActionExecuter (that, action) {

			if (action.child && action.child.token) {

				if ("object" === typeof action.params) {
					that.container.get("servers.sockets").emitTo(action.child.token, action.type.command, action.params);
				}
				else if ("string" === typeof action.params) {
					that.container.get("servers.sockets").emitTo(action.child.token, action.type.command, JSON.parse(action.params));
				}
				else {
					that.container.get("servers.sockets").emitTo(action.child.token, action.type.command);
				}

			}
			else {

				if ("object" === typeof action.params) {
					that.container.get("servers.sockets").emit(action.type.command, action.params);
				}
				else if ("string" === typeof action.params) {
					that.container.get("servers.sockets").emit(action.type.command, JSON.parse(action.params));
				}
				else {
					that.container.get("servers.sockets").emit(action.type.command);
				}

			}

		}

		function _startCrons(that) {

			return that.container.get("crons").getAll().then((crons) => {

				crons.forEach((cron) => {
					_runCron(that, cron);
				});

				return Promise.resolve();

			}).catch((err) => {
				that.container.get("logs").err("-- [crons] : " + err);
			});

		}

		function _startExecuters(that) {

			return that.container.get("actionstypes").searchOne({ code: "PLAYSOUNDONCHILD" }).then((actiontypeplaysound) => {

				return that.container.get("actions").bindExecuter(actiontypeplaysound, (action) => {

					_classicActionExecuter(that, action);

				}).then(() => {

					return that.container.get("actions").bindExecuter(actiontypeplaysound, (action) => {
						_classicActionExecuter(that, action);
					});

				});
			
			}).then(() => {

				return that.container.get("actionstypes").searchOne({ code: "READTEXTONCHILD" });

			}).then((actiontypetts) => {

				return that.container.get("actions").bindExecuter(actiontypetts, (action) => {
					_classicActionExecuter(that, action);
				});
			
			}).catch((err) => {
				that.container.get("logs").err("-- [actions] : " + err);
			});

		}

// module
	
module.exports = class MIA {

	constructor (Container) {
		this.container = Container;
	}

	start () {

		return _startCrons(this).then(() => {
			return _startExecuters(this);
		});

	}


		/*// methodes

			// private

				function _sendClients() {

					Container.get("status").getOneByCode("WAITING").then(function(waitingstatus) {

						Container.get("clients").getAll().then(function(clients) {

							try {

								clients.forEach(function (client, i) {
									clients[i].connected = false;
								});

								Container.get("servers.clients.sockets").getSockets().forEach(function(socket) {

									let isAllowed = false;

									for (let i = 0; i < clients.length; ++i) {

										if (socket.token == clients[i].token) {
											clients[i].connected = true;
											isAllowed = true;
											break;
										}

									}

									if (!isAllowed) {

										clients.push({
											status : waitingstatus,
											connected : true,
											token : socket.token,
											name : "Inconnu"
										});

									}

									Container.get("servers.clients.sockets").emit("clients", clients);

								});

							}
							catch (e) {
								Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
							}

						}).catch(function(err) {
							err = (err.message) ? err.message : err;
							Container.get("logs").err("-- [database/clients/getAll] " + ((err.message) ? err.message : err));
						});

					}).catch(function(err) {
						err = (err.message) ? err.message : err;
						Container.get("logs").err("-- [database/status/getOneByCode] " + ((err.message) ? err.message : err));
					});

				}

				function _sendChilds() {

					Container.get("status").getOneByCode("WAITING").then(function(waitingstatus) {

						Container.get("childs").getAll().then(function(childs) {

							try {

								childs.forEach(function (child, i) {
									childs[i].connected = false;
								});

								Container.get("servers.children.sockets").getSockets().forEach(function(socket) {

									let isAllowed = false;

									for (let i = 0; i < childs.length; ++i) {

										if (socket.token == childs[i].token) {
											childs[i].connected = true;
											isAllowed = true;
											break;
										}

									}

									if (!isAllowed) {

										childs.push({
											status : waitingstatus,
											connected : true,
											token : socket.token,
											name : "Inconnu"
										});

									}

								});

								Container.get("servers.clients.sockets").emit("childs", childs);

							}
							catch (e) {
								Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
							}

						}).catch(function(err) {
							err = (err.message) ? err.message : err;
							Container.get("logs").err("-- [database/childs/getAll] " + ((err.message) ? err.message : err));
						});

					}).catch(function(err) {
						err = (err.message) ? err.message : err;
						Container.get("logs").err("-- [database/status/getOneByCode] " + ((err.message) ? err.message : err));
					});

				}

				function _sendUsers() {

					Container.get("users").lastInserted().then(function(user) {

						delete user.password;

						Container.get("servers.clients.sockets").emit("users", [user]);

					}).catch(function(err) {
						err = (err.message) ? err.message : err;
						Container.get("logs").err("-- [database/users/lastInserted] " + ((err.message) ? err.message : err));
					});

				}

			// public

				this.start = function () {

					return new Promise(function(resolve, reject) {

						try {

							// events

							Container.get("servers.clients.sockets").onDisconnect(function(socket) {

								try {

									// conf

									_sendClients();

									// listeners

									socket.removeAllListeners("login");

									socket.removeAllListeners("client.allow");
									socket.removeAllListeners("client.rename");
									socket.removeAllListeners("client.delete");
									
									socket.removeAllListeners("child.allow");
									socket.removeAllListeners("child.rename");
									socket.removeAllListeners("child.delete");
									
									socket.removeAllListeners("actions");
									socket.removeAllListeners("action.execute");
									socket.removeAllListeners("action.add");
									socket.removeAllListeners("action.delete");
									
									socket.removeAllListeners("actionstypes");

									socket.removeAllListeners("crons");
									socket.removeAllListeners("cron.add");
									socket.removeAllListeners("cron.delete");
									
									socket.removeAllListeners("cronsactions");
									socket.removeAllListeners("cronaction.link");
									socket.removeAllListeners("cronaction.unlink");

									socket.removeAllListeners("user.update.login");
									socket.removeAllListeners("user.update.password");

									socket.removeAllListeners("plugins");
									socket.removeAllListeners("plugin.add.github");
									socket.removeAllListeners("plugin.update.github");
									socket.removeAllListeners("plugin.delete");

									socket.removeAllListeners("logs");

								}
								catch (e) {
									Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
								}

							})
							.onConnection(function(socket) {

								socket.token = socket.id;

								Container.get("servers.clients.sockets").setTokenToSocketById(socket.id, socket.id);

								_sendClients();
								_sendChilds();

								socket.on("login", function (p_stData) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("login");
											Container.get("logs").log(p_stData);
										}

										if (p_stData && p_stData.token) {

											Container.get("clients").getAll().then(function(clients) {

												let currentClient = false;

												for (let i = 0; i < clients.length; ++i) {

													if (p_stData.token === clients[i].token) {
														currentClient = clients[i];
														break;
													}

												}

												if (!currentClient) {
													socket.emit("login.error", "Ce client n"existe pas ou n"a pas encore été autorisé.");
												}
												else {

													socket.token = currentClient.token;

													Container.get("servers.clients.sockets").fireLogin(socket, currentClient);

													socket.emit("logged", currentClient);

													_sendChilds();
													_sendClients();

												}

											}).catch(function(err) {
												err = (err.message) ? err.message : err;
												Container.get("logs").err("-- [MIA] " + ((err.message) ? err.message : err));
											});

										}
										else if (p_stData && p_stData.login && p_stData.password) {

											Container.get("users").exists(p_stData.login, p_stData.password).then(function(exists) {

												Container.get("users").lastInserted().then(function(user) {

													Container.get("status").getOneByCode("ACCEPTED").then(function(status) {

														Container.get("clients").add({
															user : user,
															status : status,
															token : socket.id,
															name : "Nouveau client"
														}).then(function(currentClient) {

															socket.token = currentClient.token;

															Container.get("servers.clients.sockets").fireLogin(socket, currentClient);

															socket.emit("logged", currentClient);

															_sendChilds();
															_sendClients();

														}).catch(function(err) {
															Container.get("logs").err("-- [database/clients/add] " + ((err.message) ? err.message : err));
															socket.emit("login.error", "Impossible de vous connecter.");
														});

													}).catch(function(err) {
														Container.get("logs").err("-- [database/status/getOneByCode] " + ((err.message) ? err.message : err));
														socket.emit("login.error", "Impossible de vous connecter.");
													});

												}).catch(function(err) {
													Container.get("logs").err("-- [database/users/lastInserted] " + ((err.message) ? err.message : err));
													socket.emit("login.error", "Impossible de vous connecter.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [database/users/exists] " + ((err.message) ? err.message : err));
												socket.emit("login.error", "Impossible de vous connecter.");
											});

										}
										else {
											socket.emit("login.error", "Vous n"avez fourni aucune donnée d"autorisation valide.");
										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("login.error", "Impossible de vous connecter.");
									}

								})

							})

							.onLog(function(socket) {

								_sendClients();
								_sendChilds();

								socket.on("client.allow", function (client) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("client.allow");
											Container.get("logs").log(client);
										}

										if (!client || !client.token) {
											socket.emit("client.allow.error", "Les informations sur ce client sont incorrectes.");
										}
										else {

											Container.get("status").getOneByCode("ACCEPTED").then(function(status) {

												Container.get("users").lastInserted().then(function(user) {

													Container.get("clients").add({
														user : user,
														status : status,
														token : client.token,
														name : "Nouveau client"
													}).then(function(currentClient) {

														Container.get("servers.clients.sockets").fireLogin(Container.get("servers.clients.sockets").getSocket(currentClient.token), currentClient);

														Container.get("servers.clients.sockets").emitTo(currentClient.token, "logged", currentClient);

														_sendClients();

													}).catch(function(err) {
														Container.get("logs").err("-- [database/clients/add] " + ((err.message) ? err.message : err));
														socket.emit("client.allow.error", "Impossible d"enregistrer cet enfant.");
													});

												}).catch(function(err) {
													Container.get("logs").err("-- [database/users/lastInserted] " + ((err.message) ? err.message : err));
													socket.emit("client.allow.error", "Impossible d"enregistrer cet enfant.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [database/status/getOneByCode] " + ((err.message) ? err.message : err));
												socket.emit("client.allow.error", "Impossible d"enregistrer cet enfant.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("client.allow.error", "Impossible d"autoriser le client".");
									}

								})
								.on("client.rename", function (client) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("client.rename");
											Container.get("logs").log(client);
										}

										if (!client || !client.token || !client.name) {
											socket.emit("client.rename.error", "Les informations sur ce client sont incorrectes.");
										}
										else {

											Container.get("clients").rename(client.token, client.name).then(_sendClients).catch(function(err) {
												Container.get("logs").err("-- [database/clients/rename] " + ((err.message) ? err.message : err));
												socket.emit("child.rename.error", "Impossible de renommer ce client.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("client.rename.error", "Impossible d"autoriser le client".");
									}

								})
								.on("client.delete", function (client) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("client.delete");
											Container.get("logs").log(client);
										}

										if (!client || !client.token) {
											socket.emit("client.delete.error", "Les informations sur ce client sont incorrectes.");
										}
										else {

											let token = client.token;

											Container.get("clients").delete(token).then(function() {

												Container.get("servers.clients.sockets").emitTo(token, "client.deleted").disconnect(token);

												_sendClients();

											}).catch(function(err) {
												Container.get("logs").err("-- [database/clients/delete] " + ((err.message) ? err.message : err));
												socket.emit("client.delete.error", "Impossible de supprimer ce client.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("client.delete.error", "Impossible de suppprimer le client.");
									}

								})

								// childs

								.on("child.allow", function (child) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("child.allow");
											Container.get("logs").log(child);
										}

										if (!child || !child.token) {
											socket.emit("child.allow.error", "Les informations sur cet enfant sont incorrectes.");
										}
										else {

											Container.get("status").getOneByCode("ACCEPTED").then(function(status) {

												Container.get("childs").add({
													status : status,
													token : child.token,
													name : "Nouvel enfant"
												}).then(function(currentChild) {

													Container.get("servers.children.sockets").fireLogin(Container.get("servers.children.sockets").getSocket(currentChild.token), currentChild);

													Container.get("servers.children.sockets").emitTo(currentChild.token, "logged", currentChild);

													_sendChilds();

												}).catch(function(err) {
													Container.get("logs").err("-- [database/childs/add] " + ((e.message) ? e.message : e));
													socket.emit("child.allow.error", "Impossible d"autoriser cet enfant.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [database/status/getOneByCode] " + ((e.message) ? e.message : e));
												socket.emit("child.allow.error", "Impossible d"autoriser cet enfant.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("child.allow.error", "Impossible d"autoriser cet enfant.");
									}

								})
								.on("child.rename", function (child) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("child.rename");
											Container.get("logs").log(child);
										}

										if (!child || !child.token || !child.name) {
											socket.emit("child.rename.error", "Les informations sur cet enfant sont incorrectes.");
										}
										else {

											Container.get("childs").rename(child.token, child.name).then(_sendChilds).catch(function(err) {
												Container.get("logs").err("-- [database/childs/rename] " + ((err.message) ? err.message : err));
												socket.emit("child.rename.error", "Impossible de renommer cet enfant.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("child.rename.error", "Impossible de renommer cet enfant.");
									}

								})
								.on("child.delete", function (child) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("child.delete");
											Container.get("logs").log(child);
										}

										if (!child || !child.token) {
											socket.emit("child.delete.error", "Les informations sur cet enfant sont incorrectes.");
										}
										else {

											Container.get("childs").delete(child.token).then(function() {
												
												Container.get("servers.children.sockets").emitTo(child.token, "child.deleted").disconnect(child.token);

												_sendChilds();

											}).catch(function(err) {
												Container.get("logs").err("-- [database/childs/delete] " + ((err.message) ? err.message : err));
												socket.emit("child.delete.error", "Impossible de supprimer cet enfant.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("child.delete.error", "Impossible de suppprimer cet enfant.");
									}

								})

								// actions

								.on("actions", function() {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("actions");
										}

										Container.get("actions").getAll().then(function(actions) {

											socket.emit("actions", actions);

										}).catch(function(err) {
											Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
											socket.emit("actions.error", "Impossible de récupérer les actions.");
										});

									}
									catch (e) {
										Container.get("logs").err("-- [actions] " + ((e.message) ? e.message : e));
										socket.emit("actions.error", "Impossible de récupérer les actions.");
									}

								})
								.on("action.execute", function(action) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("action.execute");
											Container.get("logs").log(action);
										}

										if (!action) {
											socket.emit("actions.error", "Aucune action n"a été fournie.");
										}
										else if (!action.id) {
											socket.emit("actions.error", "L"id de l"action est manquant.");
										}
										else {

											Container.get("actions").getOneById(action.id).then(function(action) {

												if (action.child && action.child.token) {

													if ("object" === typeof action.params) {
														Container.get("servers.children.sockets").emitTo(action.child.token, action.type.command, action.params);
													}
													else if ("string" === typeof action.params) {
														Container.get("servers.children.sockets").emitTo(action.child.token, action.type.command, JSON.parse(action.params));
													}
													else {
														Container.get("servers.children.sockets").emitTo(action.child.token, action.type.command);
													}

												}
												else {

													if ("object" === typeof action.params) {
														Container.get("servers.children.sockets").emit(action.type.command, action.params);
													}
													else if ("string" === typeof action.params) {
														Container.get("servers.children.sockets").emit(action.type.command, JSON.parse(action.params));
													}
													else {
														Container.get("servers.children.sockets").emit(action.type.command);
													}

												}

											}).catch(function(err) {
												Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
												socket.emit("actions.error", "Impossible de récupérer cette action : " + ((err.message) ? err.message : err));
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [actions] " + ((e.message) ? e.message : e));
										socket.emit("actions.error", "Impossible d"exécuter cette action.");
									}

								})
								.on("action.add", function(action) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("action.add");
											Container.get("logs").log(action);
										}

										Container.get("users").lastInserted().then(function(user) {

											action.user = user;

											Container.get("actions").add(action).then(function(action) {

												socket.emit("action.added", action);

												Container.get("actions").getAll().then(function(actions) {

													socket.emit("actions", actions);

												}).catch(function(err) {
													Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
													socket.emit("actions.error", "Impossible de récupérer les actions.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
												socket.emit("actions.error", "Impossible de sauvegarder cette action : " + ((err.message) ? err.message : err));
											});

										}).catch(function(err) {
											Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
											socket.emit("actions.error", "Impossible de sauvegarder cette action : " + ((err.message) ? err.message : err));
										});

									}
									catch (e) {
										Container.get("logs").err("-- [actions] " + ((e.message) ? e.message : e));
										socket.emit("actions.error", "Impossible de sauvegarder cette action.");
									}

								})
								.on("action.delete", function(action) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("action.delete");
											Container.get("logs").log(action);
										}

										Container.get("actions").delete(action).then(function() {

											socket.emit("action.deleted");

											Container.get("actions").getAll().then(function(actions) {

												socket.emit("actions", actions);

											}).catch(function(err) {
												Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
												socket.emit("actions.error", "Impossible de récupérer les actions.");
											});

										}).catch(function(err) {
											Container.get("logs").err("-- [actions] " + ((err.message) ? err.message : err));
											socket.emit("actions.error", "Impossible de supprimer cette action : " + ((err.message) ? err.message : err));
										});

									}
									catch (e) {
										Container.get("logs").err("-- [actions] " + ((e.message) ? e.message : e));
										socket.emit("actions.error", "Impossible de supprimer cette action.");
									}

								})

								// actionstypes

								.on("actionstypes", function() {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("actionstypes");
										}

										Container.get("actionstypes").getAll().then(function(actionstypes) {

											socket.emit("actionstypes", actionstypes);

										}).catch(function(err) {
											Container.get("logs").err("-- [actionstypes] " + ((err.message) ? err.message : err));
											socket.emit("actionstypes.error", "Impossible de récupérer les types d"action.");
										});

									}
									catch (e) {
										Container.get("logs").err("-- [actionstypes] " + ((e.message) ? e.message : e));
										socket.emit("actionstypes.error", "Impossible de récupérer les types d"action.");
									}

								})

								// crons

								.on("crons", function() {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("crons");
										}

										Container.get("crons").getAll().then(function(crons) {

											socket.emit("crons", crons);

										}).catch(function(err) {
											Container.get("logs").err("-- [crons] " + ((err.message) ? err.message : err));
											socket.emit("crons.error", "Impossible de récupérer les tâches plannifiées.");
										});

									}
									catch (e) {
										Container.get("logs").err("-- [crons] " + ((e.message) ? e.message : e));
										socket.emit("crons.error", "Impossible de récupérer les tâches plannifiées.");
									}

								})
								.on("cron.add", function(cron) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("cron.add");
											Container.get("logs").log(cron);
										}

										Container.get("users").lastInserted().then(function(user) {

											cron.user = user;

											Container.get("crons").add(cron).then(function(cron) {

												socket.emit("cron.added", cron);
												_runCron(cron);

												Container.get("crons").getAll().then(function(crons) {

													socket.emit("crons", crons);

												}).catch(function(err) {
													Container.get("logs").err("-- [crons] " + ((err.message) ? err.message : err));
													socket.emit("crons.error", "Impossible de récupérer les tâches plannifiées.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [crons] " + ((err.message) ? err.message : err));
												socket.emit("crons.error", "Impossible de sauvegarder cette tâche plannifiée : " + ((err.message) ? err.message : err));
											});

										}).catch(function(err) {
											Container.get("logs").err("-- [crons] " + ((err.message) ? err.message : err));
											socket.emit("crons.error", "Impossible de sauvegarder cette tâche plannifiée : " + ((err.message) ? err.message : err));
										});

									}
									catch (e) {
										Container.get("logs").err("-- [crons] " + ((e.message) ? e.message : e));
										socket.emit("crons.error", "Impossible de sauvegarder cette tâche plannifiée.");
									}

								})
								.on("cron.delete", function(cron) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("cron.delete");
											Container.get("logs").log(cron);
										}

										Container.get("crons").delete(cron).then(function() {

											socket.emit("cron.deleted");

											Container.get("crons").getAll().then(function(crons) {

												socket.emit("crons", crons);

											}).catch(function(err) {
												Container.get("logs").err("-- [crons] " + ((err.message) ? err.message : err));
												socket.emit("crons.error", "Impossible de récupérer les tâches plannifiées.");
											});

										}).catch(function(err) {
											Container.get("logs").err("-- [crons] " + ((err.message) ? err.message : err));
											socket.emit("crons.error", "Impossible de supprimer cette tâche plannifiée : " + ((err.message) ? err.message : err));
										});

									}
									catch (e) {
										Container.get("logs").err("-- [crons] " + ((e.message) ? e.message : e));
										socket.emit("crons.error", "Impossible de supprimer cette tâche plannifiée.");
									}

								})

								// lien entre cron et action

								.on("cronsactions", function() {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("cronsactions");
										}

										Container.get("cronsactions").getAll().then(function(cronsactions) {

											socket.emit("cronsactions", cronsactions);

										}).catch(function(err) {
											Container.get("logs").err("-- [Impossible] " + ((err.message) ? err.message : err));
											socket.emit("Impossible.error", "Impossible de récupérer les liens entre tâches plannifiées et actions.");
										});
											
									}
									catch (e) {
										Container.get("logs").err("-- [Impossible] " + ((e.message) ? e.message : e));
										socket.emit("Impossible.error", "Impossible de récupérer les liens entre tâches plannifiées et actions.");
									}

								})
								.on("cronaction.link", function(data) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("cronaction.link");
											Container.get("logs").log(data);
										}

										if (!data) {
											socket.emit("cronsactions.error", "Aucune donnée renseignée.");
										}
										else if (!data.cron) {
											socket.emit("cronsactions.error", "Aucune tâche plannifiée renseignée.");
										}
										else if (!data.action) {
											socket.emit("cronsactions.error", "Aucune action renseignée.");
										}
										else {

											Container.get("cronsactions").link(data.cron, data.action).then(function() {

												socket.emit("cronaction.linked", data);

												Container.get("cronsactions").getAll().then(function(cronsactions) {

													socket.emit("cronsactions", cronsactions);

												}).catch(function(err) {
													Container.get("logs").err("-- [Impossible] " + ((err.message) ? err.message : err));
													socket.emit("Impossible.error", "Impossible de récupérer les liens entre tâches plannifiées et actions.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [cronsactions] " + ((err.message) ? err.message : err));
												socket.emit("cronsactions.error", "Impossible de lier cette tâche plannifiée à cette action : " + ((err.message) ? err.message : err));
											});
											
										}

									}
									catch (e) {
										Container.get("logs").err("-- [cronsactions] " + ((e.message) ? e.message : e));
										socket.emit("cronsactions.error", "Impossible de lier cette tâche plannifiée à cette action.");
									}

								})
								.on("cronaction.unlink", function(data) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("cronaction.unlink");
											Container.get("logs").log(data);
										}

										if (!data) {
											socket.emit("cronsactions.error", "Aucune donnée renseignée.");
										}
										else if (!data.cron) {
											socket.emit("cronsactions.error", "Aucune tâche plannifiée renseignée.");
										}
										else if (!data.action) {
											socket.emit("cronsactions.error", "Aucune action renseignée.");
										}
										else {

											Container.get("cronsactions").unlink(data.cron, data.action).then(function() {

												socket.emit("cronaction.unlinked", data);

												Container.get("cronsactions").getAll().then(function(cronsactions) {

													socket.emit("cronsactions", cronsactions);

												}).catch(function(err) {
													Container.get("logs").err("-- [Impossible] " + ((err.message) ? err.message : err));
													socket.emit("Impossible.error", "Impossible de récupérer les liens entre tâches plannifiées et actions.");
												});

											}).catch(function(err) {
												Container.get("logs").err("-- [cronsactions] " + ((err.message) ? err.message : err));
												socket.emit("cronsactions.error", "Impossible de lier cette tâche plannifiée à cette action : " + ((err.message) ? err.message : err));
											});
											
										}

									}
									catch (e) {
										Container.get("logs").err("-- [cronsactions] " + ((e.message) ? e.message : e));
										socket.emit("cronsactions.error", "Impossible de délier cette tâche plannifiée et cette action.");
									}

								})

								// user

								.on("user.update.login", function (login) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("user.update.login");
											Container.get("logs").log(login);
										}

										if (!login) {
											socket.emit("user.error", "Le login n"est pas renseigné.");
										}
										else {

											Container.get("users").lastInserted().then(function(user) {

												user.login = login;

												Container.get("users").update(user).then(function() {

													socket.emit("user.update.login", login);
													_sendUsers();

												}).catch(function(err) {
													Container.get("logs").err("-- [database/users/update] " + ((err.message) ? err.message : err));
													socket.emit("user.error", "Impossible de modifier cet utilisateur.");
												});
												
											}).catch(function(err) {
												Container.get("logs").err("-- [database/users/lastInserted] " + ((err.message) ? err.message : err));
												socket.emit("user.error", "Impossible de récupérer cet utilisateur.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("user.error", "Impossible de retrouver cet utilisateur.");
									}

								})

								.on("user.update.password", function (passwords) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("user.update.password");
										}

										if (!passwords || !passwords.password || !passwords.confirm) {
											socket.emit("user.error", "Les mots de passe ne sont pas renseignés.");
										}
										else if (passwords.password != passwords.confirm) {
											socket.emit("user.error", "Les mots de passe ne sont pas identiques.");
										}
										else {

											Container.get("users").lastInserted().then(function(user) {

												user.password = passwords.password;

												Container.get("users").update(user).then(function() {
													socket.emit("user.update.password");
												}).catch(function(err) {
													Container.get("logs").err("-- [database/users/update] " + ((err.message) ? err.message : err));
													socket.emit("user.error", "Impossible de modifier cet utilisateur.");
												});
												
											}).catch(function(err) {
												Container.get("logs").err("-- [database/users/lastInserted] " + ((err.message) ? err.message : err));
												socket.emit("user.error", "Impossible de récupérer cet utilisateur.");
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("user.error", "Impossible de suppprimer cet enfant.");
									}

								})

								// plugins

								.on("plugins", function() {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("plugins");
										}

										socket.emit("plugins", Container.get("plugins").plugins);

									}
									catch (e) {
										Container.get("logs").err("-- [plugins] " + ((e.message) ? e.message : e));
										socket.emit("plugins.error", "Impossible de récupérer les plugins.");
									}

								})
								.on("plugin.add.github", function(url) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("plugin.add.github");
											Container.get("logs").log(url);
										}

										Container.get("plugins").installViaGithub(url, Container).then(function(plugin) {
											socket.emit("plugin.added", plugin);
											socket.emit("plugins", Container.get("plugins").plugins);
										}).catch(function(err) {
											socket.emit("plugins.error", err);
											socket.emit("plugins", Container.get("plugins").plugins);
										});

									}
									catch (e) {
										Container.get("logs").err("-- [plugins] " + ((e.message) ? e.message : e));
										socket.emit("plugins.error", "Impossible d"ajouter le plugin.");
									}

								})
								.on("plugin.update.github", function(plugin) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("plugin.update.github");
											Container.get("logs").log(plugin);
										}

										Container.get("plugins").update(plugin, Container).then(function(plugin) {
											socket.emit("plugin.updated", plugin);
											socket.emit("plugins", Container.get("plugins").plugins);
										}).catch(function(err) {
											socket.emit("plugins.error", err);
											socket.emit("plugins", Container.get("plugins").plugins);
										});

									}
									catch (e) {
										Container.get("logs").err("-- [plugins] " + ((e.message) ? e.message : e));
										socket.emit("plugins.error", "Impossible de mettre à jour le plugin.");
									}

								})
								.on("plugin.delete", function(plugin) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("plugin.delete");
											Container.get("logs").log(plugin);
										}

										if (!plugin || !plugin.directory) {
											Container.get("logs").err("-- [plugins] : dossier de plugin inexistant.");
											socket.emit("plugins.error", "Impossible de suppprimer le plugin.");
										}
										else {

											Container.get("plugins").uninstall(plugin, Container).then(function() {
												socket.emit("plugins", Container.get("plugins").plugins);
											}).catch(function(err) {
												socket.emit("plugins.error", err);
												socket.emit("plugins", Container.get("plugins").plugins);
											});

										}

									}
									catch (e) {
										Container.get("logs").err("-- [plugins] " + ((e.message) ? e.message : e));
										socket.emit("plugins.error", "Impossible de suppprimer le plugin.");
									}

								})

								// logs

								.on("logs", function() {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("logs");
										}

										Container.get("logs").getLogs().then(function(logs) {
											socket.emit("logs", logs);
										}).catch(function(err) {
											Container.get("logs").err("-- [logs] " + ((err.message) ? err.message : err));
											socket.emit("logs.error", "Impossible de récupérer les logs.");
										});

									}
									catch (e) {
										Container.get("logs").err("-- [logs] " + ((e.message) ? e.message : e));
										socket.emit("logs.error", "Impossible de récupérer les logs.");
									}

								})

								.on("log", function(log) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("log");
										}

										if (!log) {
											Container.get("logs").err("-- [logs] : date manquante.");
											socket.emit("logs.error", "Impossible de voir le log : date manquante.");
										}
										else if (!log.year) {
											Container.get("logs").err("-- [logs] : donnée "year" manquante.");
											socket.emit("logs.error", "Impossible de voir le log : donnée "year" manquante.");
										}
										else if (!log.month) {
											Container.get("logs").err("-- [logs] : donnée "month" manquante.");
											socket.emit("logs.error", "Impossible de voir le log : donnée "month" manquante.");
										}
										else if (!log.day) {
											Container.get("logs").err("-- [logs] : donnée "day" manquante.");
											socket.emit("logs.error", "Impossible de voir le log : donnée "day" manquante.");
										}
										else {

											Container.get("logs").read(log.year, log.month, log.day).then(function(content) {
												socket.emit("log", content);
											}).catch(function(err) {
												Container.get("logs").err("-- [logs] " + ((err.message) ? err.message : err));
												socket.emit("logs.error", "Impossible de lire le log.");
											});
											
										}

									}
									catch (e) {
										Container.get("logs").err("-- [logs] " + ((e.message) ? e.message : e));
										socket.emit("logs.error", "Impossible de récupérer les logs.");
									}

								});

							});

							Container.get("servers.children.sockets").onDisconnect(function(socket) {

								try {

									// conf

									_sendChilds();

									// listeners

										// login

										socket.removeAllListeners("login");

										// media

										socket.removeAllListeners("media.sound.error");
										socket.removeAllListeners("media.sound.played");
										socket.removeAllListeners("media.sound.downloaded");

										socket.removeAllListeners("media.video.error");
										socket.removeAllListeners("media.video.played");
										socket.removeAllListeners("media.video.downloaded");

										socket.removeAllListeners("tts.error");
										socket.removeAllListeners("tts.defaultvoice");
										socket.removeAllListeners("tts.voices");
										socket.removeAllListeners("tts.read");

								}
								catch (e) {
									Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
								}

							})
							.onConnection(function(socket) {

								socket.token = socket.id;
								Container.get("servers.children.sockets").setTokenToSocketById(socket.id, socket.id);
								_sendChilds();
								
								// childs

								socket.on("login", function (data) {

									try {

										if (Container.get("conf").get("debug")) {
											Container.get("logs").log("login");
											Container.get("logs").log(data);
										}

										if (data && data.token) {

											Container.get("childs").getAll().then(function(childs) {

												let currentChild = false;

												for (let i = 0; i < childs.length; ++i) {

													if (data.token === childs[i].token) {
														currentChild = childs[i];
														break;
													}

												}

												if (!currentChild) {
													socket.emit("login.error", "Cet enfant n"existe pas ou n"a pas encore été autorisé.");
												}
												else {

													socket.token = currentChild.token;

													Container.get("servers.children.sockets").fireLogin(socket, currentChild);

													socket.emit("logged", currentChild);
													_sendChilds();

												}

											}).catch(function(err) {
												Container.get("logs").err("-- [MIA] " + ((err.message) ? err.message : err));
												socket.emit("login.error", "Impossible de vous connecter.");
											});

										}
										else {
											socket.emit("login.error", "Vous n"avez fourni aucune donnée d"autorisation valide.");
										}

									}
									catch (e) {
										Container.get("logs").err("-- [MIA] " + ((e.message) ? e.message : e));
										socket.emit("login.error", "Impossible de vous connecter.");
									}

								});

							})
							.onLog(function(socket) {

								socket.on("media.sound.error", function (error) {
									Container.get("logs").err("play sound - " + error);
									Container.get("servers.clients.sockets").emit("media.sound.error", error);
								})
								.on("media.sound.played", function (data) {
									Container.get("logs").log("media.sound.played");
									Container.get("servers.clients.sockets").emit("media.sound.played", data);
								})
								.on("media.sound.downloaded", function (data) {
									Container.get("logs").log("media.sound.downloaded");
									Container.get("servers.clients.sockets").emit("media.sound.downloaded", data);
								})

								.on("media.video.error", function (error) {
									Container.get("logs").err("play video - " + error);
									Container.get("servers.clients.sockets").emit("media.video.error", error);
								})
								.on("media.video.played", function (data) {
									Container.get("logs").log("media.video.played");
									Container.get("servers.clients.sockets").emit("media.video.played", data);
								})
								.on("media.video.downloaded", function (data) {
									Container.get("logs").log("media.video.downloaded");
									Container.get("servers.clients.sockets").emit("media.video.downloaded", data);
								})

								.on("tts.error", function (error) {
									Container.get("logs").err("tts.error");
									Container.get("logs").err(error);
									Container.get("servers.clients.sockets").emit("tts.error", error);
								})
								.on("tts.defaultvoice", function (defaultVoice) {
									Container.get("logs").log("tts.defaultvoice");
									Container.get("servers.clients.sockets").emit("tts.defaultvoice", defaultVoice);
								})
								.on("tts.voices", function (voices) {
									Container.get("logs").log("tts.voices");
									Container.get("servers.clients.sockets").emit("tts.voices", voices);
								})
								.on("tts.read", function (text) {
									Container.get("logs").log("tts.read");
									Container.get("logs").log(text);
									Container.get("servers.clients.sockets").emit("tts.read", text);
								});

							});

							// run

						}
						catch (e) {
							reject((e.message) ? e.message : e);
						}

					});

				};*/

	};
	