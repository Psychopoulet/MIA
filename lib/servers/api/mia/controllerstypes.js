
"use strict";

// module

module.exports = (container) => {

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/controllerstypes", (req, res) => {

				container.get("controllerstypes").search().then((controllerstypes) => {
					container.get("servers.web").sendValidJSONResponse(req, res, controllerstypes);
				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
					container.get("logs").err("-- [database/controllerstypes/search] " + err);
						
				});

			}).get("/api/controllerstypes/:code", (req, res) => {

				if (!req.params || "string" !== typeof req.params.code) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllerstypes-searchone-020", message: "Il manque le code" } ]);
				}
					else if ("" === req.params.code.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "controllerstypes-searchone-021", message: "Le code est vide" } ]);
					}
				else {

					container.get("controllerstypes").searchOne({ code: req.params.code.trim().toUpperCase() }).then((controllerType) => {
						container.get("servers.web").sendValidJSONResponse(req, res, controllerType);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/controllerstypes/searchone] " + err);
							
					});
					
				}

			})

		);

	// sockets

};
