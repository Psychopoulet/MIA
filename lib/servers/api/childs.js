
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/childs", (req, res) => {

			container.get("status").searchOne({ code : "WAITING" }).then(function(waitingstatus) {

				container.get("childs").search().then(function(childs) {

					childs.forEach(function (child, i) {
						childs[i].connected = false;
					});

					/*container.get("servers.children.sockets").getSockets().forEach(function(socket) {

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

					});*/

					container.get("servers.web").sendValidJSONResponse(res, childs);

				}).catch(function(err) {

					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, err);
					container.get("logs").err("-- [database/childs/search] " + err);

				});

			}).catch(function(err) {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/status/searchOne] " + err);
					
			});

		})

	);

};
