
"use strict";

// deps

	const DBDevices = require(require("path").join(__dirname, "..", "..", "..", "database", "devices.js"));

// module

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/devices", (req, res) => {

			container.get("status").searchOne({ code : "WAITING" }).then(function(waitingstatus) {

				container.get("devices").search().then(function(devices) {

					devices.forEach(function (child, i) {
						devices[i].connected = false;
					});

					container.get("servers.web").multiserver.servers.forEach(function(current) {

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

				}).catch(function(err) {

					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, err);
					container.get("logs").err("-- [database/devices/search] " + err);

				});

			}).catch(function(err) {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/status/searchOne] " + err);
					
			});

		})

	);

};
