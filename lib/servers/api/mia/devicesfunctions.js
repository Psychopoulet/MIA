
"use strict";

// module

module.exports = (container) => {

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/devicesfunctions", (req, res) => {

				container.get("devicesfunctions").search().then((devicesfunctions) => {
					container.get("servers.web").sendValidJSONResponse(res, devicesfunctions);
				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, err);
					container.get("logs").err("-- [database/devicesfunctions/search] " + err);
						
				});

			}).get("/api/devicesfunctions/:code", (req, res) => {

				if (!req.params || "string" !== typeof req.params.code) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devicesfunctions-searchone-020", message: "Il manque le code" } ]);
				}
					else if ("" === req.params.code.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "devicesfunctions-searchone-021", message: "Le code est vide" } ]);
					}
				else {

					container.get("devicesfunctions").searchOne({ code: req.params.code.trim().toUpperCase() }).then((devicefunction) => {
						container.get("servers.web").sendValidJSONResponse(res, devicefunction);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, err);
						container.get("logs").err("-- [database/devicesfunctions/searchone] " + err);
							
					});
					
				}

			})

		);

	// sockets

};
