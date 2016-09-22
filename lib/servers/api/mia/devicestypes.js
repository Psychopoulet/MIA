
"use strict";

// module

module.exports = (container) => {

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/devicestypes", (req, res) => {

				container.get("devicestypes").search().then((devicestypes) => {
					container.get("servers.web").sendValidJSONResponse(req, res, devicestypes);
				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
					container.get("logs").err("-- [database/devicestypes/search] " + err);
						
				});

			}).get("/api/devicestypes/:code", (req, res) => {

				if (!req.params || "string" !== typeof req.params.code) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "devicestypes-searchone-020", message: "Il manque le code" } ]);
				}
					else if ("" === req.params.code.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "devicestypes-searchone-021", message: "Le code est vide" } ]);
					}
				else {

					container.get("devicestypes").searchOne({ code: req.params.code.trim().toUpperCase() }).then((deviceType) => {
						container.get("servers.web").sendValidJSONResponse(req, res, deviceType);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/devicestypes/searchone] " + err);
							
					});
					
				}

			})

		);

	// sockets

};
