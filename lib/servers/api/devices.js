
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/devices", (req, res) => {

			container.get("status").searchOne({ code : "WAITING" }).then(function(/*waitingstatus*/) {

				container.get("devices").search().then(function(devices) {

					devices.forEach(function (child, i) {
						devices[i].connected = false;
					});

					/*container.get("servers.children.sockets").getSockets().forEach(function(socket) {

						let isAllowed = false;

						for (let i = 0; i < devices.length; ++i) {

							if (socket.token == devices[i].token) {
								devices[i].connected = true;
								isAllowed = true;
								break;
							}

						}

						if (!isAllowed) {

							devices.push({
								status : waitingstatus,
								connected : true,
								token : socket.token,
								name : "Inconnu"
							});

						}

					});*/

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
