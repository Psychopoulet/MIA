
"use strict";

// deps

	const	http = require("http"), https = require("https"),
			DBDevices = require(require("path").join(__dirname, "..", "..", "..", "database", "devices.js"));

// module

module.exports = (container) => {

	// private

		// attrs

			let _waitingstatus = null;

		// methods

			function _getDevices() {

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

					return container.get("devices").search().then((devices) => {

						devices.forEach((child, i) => {
							devices[i].connected = false;
						});

						container.get("servers.web").multiserver.servers.forEach((current) => {

							for (let key in current.sockets.sockets.sockets) {

								if (current.sockets.sockets.sockets[key].MIAToken) {

									for (let i = 0; i < devices.length; ++i) {

										if (current.sockets.sockets.sockets[key].MIAToken && current.sockets.sockets.sockets[key].MIAToken == devices[i].token) {
											devices[i].connected = true;
											break;
										}

									}

								}
								else {

									devices.push(
										DBDevices.formate({

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

						return Promise.resolve(devices);

					});

				});

			}

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/devices", (req, res) => {

				_getDevices().then((devices) => {
					container.get("servers.web").sendValidJSONResponse(res, devices);
				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-search-catch", message: err } ]);
					container.get("logs").err("-- [database/devices/search] " + err);
						
				});

			}).put("/api/devices", (req, res) => {

				container.get("devicestypes").searchOne({ code: "WEB" }).then((devicetype) => {

					if (!devicetype) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-creation-020", message: "Ce type de périphérique n'existe pas" } ]);
					}
					else {

						container.get("status").searchOne({ code: "WAITING" }).then((status) => {

							if (!status) {
								container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-creation-030", message: "Ce statut n'existe pas" } ]);
							}
							else {

								container.get("devices").add({
									status: status,
									type: devicetype,
									name: "Inconnu"
								}).then((device) => {

									container.get("servers.web").sendValidJSONResponse(res, device);

									_getDevices().then((devices) => {
										container.get("servers.web").emit("devices", devices);
									}).catch((err) => {
										container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {

									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-creation-catch", message: err } ]);
									container.get("logs").err("-- [database/devices/add] " + err);
										
								});
								
							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-creation-catch", message: err } ]);
							container.get("logs").err("-- [database/status/searchone] " + err);
					
						});
				
					}

				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-creation-catch", message: err } ]);
					container.get("logs").err("-- [database/devicestypes/searchone] " + err);
			
				});

			}).post("/api/devices/check", (req, res) => {

				if (!req.body) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-check-010", message: "Il n'y a aucune donnée" } ]);
				}
				else if ("string" !== typeof req.body.token) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-check-020", message: "Il manque le token" } ]);
				}
					else if ("" === req.body.token.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-check-021", message: "Le token est vide" } ]);
					}
				else {

					container.get("devices").searchOne({ token: req.body.token.trim() }).then((device) => {

						if (!device) {
							container.get("servers.web").sendNotLoggedJSONResponse(res, [ { code: "devices-check-22", message: "Le périphérique lié à ce token n'existe pas" } ]);
						}
						else if (!device.status || !device.status.code || "ACCEPTED" !== device.status.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-check-30", message: "Le périphérique n'a pas été validé" } ]);
						}
						else {
							container.get("servers.web").sendValidJSONResponse(res);
						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-check-catch", message: err } ]);
						container.get("logs").err("-- [database/devices/searchOne] " + err);
							
					});

				}

			}).post("/api/devices/:token/validation", (req, res) => {

				if (!req.body) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-010", message: "Il n'y a aucune donnée" } ]);
				}
				else if ("string" !== typeof req.body.token) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-020", message: "Il manque le token" } ]);
				}
					else if ("" === req.body.token.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-021", message: "Le token est vide" } ]);
					}
				else if ("object" !== typeof req.params) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-030", message: "Il manque le périphérique" } ]);
				}
					else if ("string" !== typeof req.params.token) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-031", message: "Le périphérique n'a pas de token" } ]);
					}
					else if ("" === req.params.token.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-032", message: "Le token du périphérique est vide" } ]);
					}
				else {

					container.get("devices").searchOne({ token: req.params.token.trim() }).then((device) => {

						if (!device) {
							container.get("servers.web").sendNotLoggedJSONResponse(res, [ { code: "devices-validation-33", message: "Le périphérique n'existe pas" } ]);
						}
						else {

							container.get("status").searchOne({ code: "ACCEPTED" }).then((status) => {

								if (!status) {
									container.get("servers.web").sendNotLoggedJSONResponse(res, [ { code: "devices-validation-40", message: "Le statut n'existe pas" } ]);
								}
								else {

									device.status = status;

									container.get("devices").edit(device).then(() => {

										container.get("servers.web").sendValidJSONResponse(res, device);

										_getDevices().then((devices) => {
											container.get("servers.web").emit("devices", devices);
										}).catch((err) => {
											container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
										});

									}).catch((err) => {
										
										err = (err.message) ? err.message : err;

										container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-validation-catch", message: err } ]);
										container.get("logs").err("-- [database/devices/edit] " + err);
											
									});

								}

							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-validation-catch", message: err } ]);
								container.get("logs").err("-- [database/status/searchOne] " + err);
									
							});

						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-validation-catch", message: err } ]);
						container.get("logs").err("-- [database/devices/searchOne] " + err);
							
					});

				}

			}).delete("/api/devices/:token", (req, res) => {

				console.log(req.body);

				if (!req.body) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-010", message: "Il n'y a aucune donnée" } ]);
				}
				else if ("string" !== typeof req.body.token) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-020", message: "Il manque le token" } ]);
				}
					else if ("" === req.body.token.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-021", message: "Le token est vide" } ]);
					}
				else if ("object" !== typeof req.params) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-030", message: "Il manque le périphérique" } ]);
				}
					else if ("string" !== typeof req.params.token) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-031", message: "Le périphérique n'a pas de token" } ]);
					}
					else if ("" === req.params.token.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-validation-032", message: "Le token du périphérique est vide" } ]);
					}
				else {

					container.get("devices").searchOne({ token: req.params.token.trim() }).then((device) => {

						if (!device) {
							container.get("servers.web").sendNotLoggedJSONResponse(res, [ { code: "devices-delete-33", message: "Le périphérique n'existe pas" } ]);
						}
						else {

							container.get("devices").delete(device).then(() => {

								container.get("servers.web").sendValidJSONResponse(res);

								_getDevices().then((devices) => {
									container.get("servers.web").emit("devices", devices);
								}).catch((err) => {
									container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
								});

							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-delete-catch", message: err } ]);
								container.get("logs").err("-- [database/status/searchOne] " + err);
									
							});

						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-delete-catch", message: err } ]);
						container.get("logs").err("-- [database/devices/searchOne] " + err);
							
					});

				}

			})

		);

	// sockets

		container.get("servers.web").connection((socket, server) => {

			_getDevices().then((devices) => {
				container.get("servers.web").broadcast(socket, server, "devices", devices);
			}).catch((err) => {
				container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
			});

			socket.on("disconnect", () => {

				_getDevices().then((devices) => {
					container.get("servers.web").broadcast(socket, server, "devices", devices);
				}).catch((err) => {
					container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
				});

			});

			socket.on("device.check", (token) => {

				if ("string" !== typeof token) {
					socket.emit("device.check.error", [ { code: "devices-check-020", message: "Il manque le token" } ]);
				}
					else if ("" === token.trim()) {
						socket.emit("device.check.error", [ { code: "devices-check-021", message: "Le token est vide" } ]);
					}
				else {

					container.get("devices").searchOne({ token: token.trim() }).then((device) => {

						if (!device) {
							socket.emit("device.check.error", [ { code: "devices-check-22", message: "Le périphérique lié à ce token n'existe pas" } ]);
							socket.disconnect();
						}
						else if (!device.status || !device.status.code || "ACCEPTED" !== device.status.code) {
							socket.emit("device.check.error", [ { code: "devices-check-30", message: "Le périphérique n'a pas été validé" } ]);
							socket.disconnect();
						}
						else {

							socket.MIAToken = token;
							socket.emit("device.checked");

						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						socket.emit("device.check.error", [ { code: "devices-check-catch", message: err } ]);
						container.get("logs").err("-- [database/devices/searchOne] " + err);
						
					});

				}

			});

		});

};
