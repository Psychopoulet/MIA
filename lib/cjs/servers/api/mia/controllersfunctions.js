
"use strict";

// module

module.exports = (container) => {

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/controllersfunctions", (req, res) => {

				container.get("controllersfunctions").search().then((controllersfunctions) => {
					container.get("servers.web").sendValidJSONResponse(req, res, controllersfunctions);
				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
					container.get("logs").err("-- [database/controllersfunctions/search] " + err);
						
				});

			}).get("/api/controllersfunctions/:code", (req, res) => {

				if (!req.params || "string" !== typeof req.params.code) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllersfunctions-searchone-020", message: "Il manque le code" } ]);
				}
					else if ("" === req.params.code.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllersfunctions-searchone-021", message: "Le code est vide" } ]);
					}
				else {

					container.get("controllersfunctions").searchOne({ code: req.params.code.trim().toUpperCase() }).then((controllerfunction) => {
						container.get("servers.web").sendValidJSONResponse(req, res, controllerfunction);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/controllersfunctions/searchone] " + err);
							
					});
					
				}

			})

		);

	// sockets

};
