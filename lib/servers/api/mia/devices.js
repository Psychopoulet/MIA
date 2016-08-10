
"use strict";

// deps

	const DBDevices = require(require("path").join(__dirname, "..", "..", "..", "database", "devices.js"));

// module

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/devices", (req, res) => {

			container.get("status").searchOne({ code : "WAITING" }).then((waitingstatus) => {

				container.get("devices").search().then((devices) => {

					devices.forEach((child, i) => {
						devices[i].connected = false;
					});

					container.get("servers.web").multiserver.servers.forEach((current) => {

						for (let key in current.sockets.sockets.sockets) {

							let isAllowed = false;
							let socket = current.sockets.sockets.sockets[key];

							for (let i = 0; i < devices.length; ++i) {

								if (socket.MIAToken && socket.MIAToken == devices[i].token) {
									devices[i].connected = true;
									isAllowed = true;
									break;
								}

							}

							if (!isAllowed) {

								devices.push(
									DBDevices.formate({
										status : waitingstatus,
										connected : true,
										name : "Inconnu"
									})
								);

							}

						}

					});

					container.get("servers.web").sendValidJSONResponse(res, devices);

				}).catch((err) => {

					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-search-catch", message: err } ]);
					container.get("logs").err("-- [database/devices/search] " + err);

				});

			}).catch((err) => {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "devices-search-catch", message: err } ]);
				container.get("logs").err("-- [database/status/searchOne] " + err);
					
			});

		}).post("/api/devices/check", (req, res) => {

			if (!req.body) {
				container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-check-010", message: "Il n'y a aucune donnée de connexion" } ]);
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
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devices-check-undone", message: "en cours" } ]);
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

		})

	);

};
