
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/clients", (req, res) => {

			container.get("status").searchOne("WAITING").then(function(waitingstatus) {

				container.get("clients").search().then(function(clients) {

					clients.forEach(function (client, i) {
						clients[i].connected = false;
					});

					/*container.get("servers.clients.sockets").getSockets().forEach(function(socket) {

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

					});*/

					container.get("servers.web").sendValidJSONResponse(res, clients);

				}).catch(function(err) {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, err);
					container.get("logs").err("-- [database/clients/search] " + err);

				});

			}).catch(function(err) {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/status/searchOne] " + err);
					
			});

		})

	);

};
