
"use strict";

// deps

	const DBControllers = require(require("path").join(__dirname, "..", "..", "..", "database", "controllers.js"));

// module

module.exports = (container) => {

	// private

		// attrs

			let _waitingstatus = null;

		// methods

			function _getControllers() {

				return Promise.resolve().then(() => {

					if (_waitingstatus) {
						return Promise.resolve();
					}
					else {

						return container.get("status").searchOne({ code : "WAITING" }).then((waitingstatus) => {
							_waitingstatus = waitingstatus;
							return Promise.resolve();
						});

					}

				}).then(() => {

					return container.get("controllers").search().then((controllers) => {

						controllers.forEach((child, i) => {
							controllers[i].connected = false;
						});

						container.get("servers.web").multiserver.servers.forEach((current) => {

							for (let key in current.sockets.sockets.sockets) {

								if (current.sockets.sockets.sockets[key].MIAToken) {

									for (let i = 0; i < controllers.length; ++i) {

										if (current.sockets.sockets.sockets[key].MIAToken && current.sockets.sockets.sockets[key].MIAToken == controllers[i].token) {
											controllers[i].connected = true;
											break;
										}

									}

								}
								else {

									controllers.push(
										DBControllers.formate({

											status_id : _waitingstatus.id,
											status_code : _waitingstatus.code,
											status_name : _waitingstatus.name,
											status_color_background : _waitingstatus.colors.background,
											status_color_text : _waitingstatus.colors.text,

											connected : true,
											name : "Inconnu"

										})
									);

								}

							}

						});

						return Promise.resolve(controllers);

					});

				});

			}

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/controllers", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					_getControllers().then((controllers) => {
						container.get("servers.web").sendValidJSONResponse(req, res, controllers);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/controllers/search] " + err);
							
					});

				}).catch((err) => {
					container.get("logs").warn("-- [rights] " + ((err.message) ? err.message : err));
				});

			}).get("/api/controllers/:token", (req, res) => {

				container.get("servers.web").checkAPI_userAllowedOrWaiting(req, res).then((myController) => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-searchone-020", message: "Il manque le contrôleur" } ]);
					}
						else if ("string" !== typeof req.params.token) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-searchone-021", message: "Le contrôleur n'a pas de token" } ]);
						}
						else if ("" === req.params.token.trim()) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-searchone-022", message: "Le token du contrôleur est vide" } ]);
						}
					else {

						if ("WAITING" === myController.status.code && myController.token != req.params.token.trim()) {
							container.get("servers.web").sendNotAllowedJSONResponse(req, res);
						}
						else if ("ACCEPTED" !== myController.status.code && "WAITING" !== myController.status.code) {
							container.get("servers.web").sendNotAllowedJSONResponse(req, res);
						}
						else {

							container.get("controllers").searchOne({ token: req.params.token.trim() }).then((searchedController) => {
								container.get("servers.web").sendValidJSONResponse(req, res, searchedController);
							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
								container.get("logs").err("-- [database/controllers/searchone] " + err);
									
							});
							
						}

					}

				}).catch((err) => {
					container.get("logs").warn("-- [rights] " + ((err.message) ? err.message : err));
				});

			}).put("/api/controllers", (req, res) => {

				container.get("controllerstypes").searchOne(
					(req.body && req.body.type && req.body.type.code) ? req.body.type : { code: "WEB" }
				).then((controllertype) => {

					if (!controllertype) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-creation-020", message: "Ce type de contrôleur n'existe pas" } ]);
					}
					else {

						container.get("status").searchOne({ code: "WAITING" }).then((status) => {

							if (!status) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-creation-030", message: "Ce statut n'existe pas" } ]);
							}
							else {

								container.get("controllers").add({
									status: status,
									type: controllertype,
									name: "Inconnu"
								}).then((controller) => {

									container.get("servers.web").sendCreatedJSONResponse(req, res, controller);

									_getControllers().then((controllers) => {
										container.get("servers.web").emit("controllers", controllers);
									}).catch((err) => {
										container.get("logs").err("-- [database/controllers/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {

									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/controllers/add] " + err);
										
								});
								
							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/status/searchone] " + err);
					
						});
				
					}

				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
					container.get("logs").err("-- [database/controllerstypes/searchone] " + err);
			
				});
				
			}).post("/api/controllers/:token", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then((myController) => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-edit-020", message: "Il manque le contrôleur" } ]);
					}
						else if ("string" !== typeof req.params.token) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-edit-021", message: "Le contrôleur n'a pas de token" } ]);
						}
						else if ("" === req.params.token.trim()) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-edit-022", message: "Le token du contrôleur est vide" } ]);
						}
					else if (!req.body) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-edit-030", message: "Il manque les données à modifier" } ]);
					}
					else {

						container.get("controllers").searchOne(req.body).then((controller) => {

							if (!controller) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-edit-040", message: "Le contrôleur n'existe pas" } ]);
							}
							else {

								if (req.body.name) {
									controller.name = req.body.name;
								}
								if (req.body.status) {
									controller.status = req.body.status;
								}
								if (req.body.type) {
									controller.type = req.body.type;
								}

								if (!controller.user) {

									if (req.body.user) {
										controller.user = req.body.user;
									}
									else {
										controller.user = myController.user;
									}

								}

								container.get("controllers").edit(controller).then((controller) => {

									container.get("servers.web").sendValidJSONResponse(req, res, controller);

									_getControllers().then((controllers) => {
										container.get("servers.web").emit("controllers", controllers);
									}).catch((err) => {
										container.get("logs").err("-- [database/controllers/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {

									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/controllers/edit] " + err);
										
								});
								
							}
						
						}).catch((err) => {

							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/controllers/searchone] " + err);
								
						});

					}

				}).catch((err) => {
					container.get("logs").warn("-- [rights] " + ((err.message) ? err.message : err));
				});
				
			}).delete("/api/controllers/:token", (req, res) => {

				container.get("servers.web").checkAPI_userAllowedOrWaiting(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-delete-020", message: "Il manque le contrôleur" } ]);
					}
						else if ("string" !== typeof req.params.token) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-delete-021", message: "Le contrôleur n'a pas de token" } ]);
						}
						else if ("" === req.params.token.trim()) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-delete-022", message: "Le token du contrôleur est vide" } ]);
						}
					else {

						container.get("controllers").searchOne({ token: req.params.token.trim() }).then((controller) => {

							if (!controller) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllers-delete-030", message: "Le contrôleur n'existe pas" } ]);
							}
							else {

								container.get("controllers").delete(controller).then(() => {

									container.get("servers.web").sendDeletedJSONResponse(req, res);

									_getControllers().then((controllers) => {
										container.get("servers.web").emit("controllers", controllers);
									}).catch((err) => {
										container.get("logs").err("-- [database/controllers/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {
									
									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/status/searchone] " + err);
										
								});

							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/controllers/searchene] " + err);
								
						});

					}

				}).catch((err) => {
					container.get("logs").warn("-- [rights] " + ((err.message) ? err.message : err));
				});

			})

		);

	// sockets

		container.get("servers.web").connection((socket, server) => {

			_getControllers().then((controllers) => {
				container.get("servers.web").broadcast(socket, server, "controllers", controllers);
			}).catch((err) => {
				container.get("logs").err("-- [database/controllers/search] " + ((err.message) ? err.message : err));
			});

			socket.on("disconnect", () => {

				_getControllers().then((controllers) => {
					container.get("servers.web").broadcast(socket, server, "controllers", controllers);
				}).catch((err) => {
					container.get("logs").err("-- [database/controllers/search] " + ((err.message) ? err.message : err));
				});

			});

			socket.on("token", (token) => {

				if ("string" !== typeof token) {
					socket.emit("token.error", [ { code: "token-010", message: "Il manque le token" } ]);
				}
					else if ("" === token.trim()) {
						socket.emit("token.error", [ { code: "token-011", message: "Le token est vide" } ]);
					}
				else {

					container.get("controllers").searchOne({ token: token.trim() }).then((controller) => {

						if (!controller) {
							socket.emit("token.error", [ { code: "token-22", message: "Le contrôleur lié à ce token n'existe pas" } ]);
							socket.disconnect();
						}
						else if (!controller.status || !controller.status.code || "ACCEPTED" !== controller.status.code) {
							socket.emit("token.error", [ { code: "token-30", message: "Le contrôleur n'a pas été validé" } ]);
							socket.disconnect();
						}
						else {

							socket.MIAToken = token;
							socket.emit("token", token);

						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						socket.emit("token.error", [ { code: "token-catch", message: err } ]);
						container.get("logs").err("-- [database/controllers/searchone] " + err);
						
					});

				}

			});

		});

};
