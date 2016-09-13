
"use strict";

// deps

	const DBDevices = require(require("path").join(__dirname, "..", "..", "..", "database", "devices.js"));

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

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					_getDevices().then((devices) => {
						container.get("servers.web").sendValidJSONResponse(res, devices);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, err);
						container.get("logs").err("-- [database/devices/search] " + err);
							
					});

				});

			}).get("/api/devices/:token", (req, res) => {

				container.get("servers.web").checkAPI_userAllowedOrWaiting(req, res).then((myDevice) => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-searchone-020", message: "Il manque le périphérique" } ]);
					}
						else if ("string" !== typeof req.params.token) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-searchone-021", message: "Le périphérique n'a pas de token" } ]);
						}
						else if ("" === req.params.token.trim()) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-searchone-022", message: "Le token du périphérique est vide" } ]);
						}
					else {

						if ("WAITING" === myDevice.status.code && myDevice.token != req.params.token.trim()) {
							container.get("servers.web").sendNotAllowedJSONResponse(res);
						}
						else if ("ACCEPTED" !== myDevice.status.code && "WAITING" !== myDevice.status.code) {
							container.get("servers.web").sendNotAllowedJSONResponse(res);
						}
						else {

							container.get("devices").searchOne({ token: req.params.token.trim() }).then((searchedDevice) => {
								container.get("servers.web").sendValidJSONResponse(res, searchedDevice);
							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								container.get("servers.web").sendInternalErrorJSONResponse(res, err);
								container.get("logs").err("-- [database/devices/searchone] " + err);
									
							});
							
						}

					}

				});

			}).put("/api/devices", (req, res) => {

				container.get("devicestypes").searchOne(
					(req.body && req.body.type && req.body.type.code) ? req.body.type : { code: "WEB" }
				).then((devicetype) => {

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

									container.get("servers.web").sendInternalErrorJSONResponse(res, err);
									container.get("logs").err("-- [database/devices/add] " + err);
										
								});
								
							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(res, err);
							container.get("logs").err("-- [database/status/searchone] " + err);
					
						});
				
					}

				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, err);
					container.get("logs").err("-- [database/devicestypes/searchone] " + err);
			
				});
				
			}).post("/api/devices/:token", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-edit-020", message: "Il manque le périphérique" } ]);
					}
						else if ("string" !== typeof req.params.token) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-edit-021", message: "Le périphérique n'a pas de token" } ]);
						}
						else if ("" === req.params.token.trim()) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-edit-022", message: "Le token du périphérique est vide" } ]);
						}
					else if (!req.body) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-edit-030", message: "Il manque les données à modifier" } ]);
					}
					else {

						container.get("devices").searchOne(req.body).then((device) => {

							if (!device) {
								container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-040", message: "Le périphérique n'existe pas" } ]);
							}
							else {

								if (req.body.name) {
									device.name = req.body.name;
								}

								console.log(device);

								container.get("devices").edit(device).then((device) => {

									container.get("servers.web").sendValidJSONResponse(res, device);

									_getDevices().then((devices) => {
										container.get("servers.web").emit("devices", devices);
									}).catch((err) => {
										container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {

									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(res, err);
									container.get("logs").err("-- [database/devices/edit] " + err);
										
								});
								
							}
						
						}).catch((err) => {

							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(res, err);
							container.get("logs").err("-- [database/devices/searchone] " + err);
								
						});

					}

				});
				
			}).delete("/api/devices/:token", (req, res) => {

				container.get("servers.web").checkAPI_userAllowedOrWaiting(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-020", message: "Il manque le périphérique" } ]);
					}
						else if ("string" !== typeof req.params.token) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-021", message: "Le périphérique n'a pas de token" } ]);
						}
						else if ("" === req.params.token.trim()) {
							container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-022", message: "Le token du périphérique est vide" } ]);
						}
					else {

						container.get("devices").searchOne({ token: req.params.token.trim() }).then((device) => {

							if (!device) {
								container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-delete-030", message: "Le périphérique n'existe pas" } ]);
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

									container.get("servers.web").sendInternalErrorJSONResponse(res, err);
									container.get("logs").err("-- [database/status/searchone] " + err);
										
								});

							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(res, err);
							container.get("logs").err("-- [database/devices/searchene] " + err);
								
						});

					}

				});

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

			socket.on("token", (token) => {

				if ("string" !== typeof token) {
					socket.emit("token.error", [ { code: "token-010", message: "Il manque le token" } ]);
				}
					else if ("" === token.trim()) {
						socket.emit("token.error", [ { code: "token-011", message: "Le token est vide" } ]);
					}
				else {

					container.get("devices").searchOne({ token: token.trim() }).then((device) => {

						if (!device) {
							socket.emit("token.error", [ { code: "token-22", message: "Le périphérique lié à ce token n'existe pas" } ]);
							socket.disconnect();
						}
						else if (!device.status || !device.status.code || "ACCEPTED" !== device.status.code) {
							socket.emit("token.error", [ { code: "token-30", message: "Le périphérique n'a pas été validé" } ]);
							socket.disconnect();
						}
						else {

							socket.MIAToken = token;
							socket.emit("token", token);

						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						socket.emit("token.error", [ { code: "token-catch", message: err } ]);
						container.get("logs").err("-- [database/devices/searchone] " + err);
						
					});

				}

			});

		});

};
