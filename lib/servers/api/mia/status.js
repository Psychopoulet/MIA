
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/status", (req, res) => {

			container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

				container.get("status").search().then(function(status) {

					container.get("servers.web").sendValidJSONResponse(req, res, status);

				}).catch(function(err) {

					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
					container.get("logs").err("-- [database/status/search] " + err);

				});

			});

		}).get("/api/status/:code", (req, res) => {

			container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

				if (!req.params || "string" !== typeof req.params.code) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "status-searchone-020", message: "Il manque le code" } ]);
				}
					else if ("" === req.params.code.trim()) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "status-searchone-021", message: "Le code est vide" } ]);
					}
				else {

					container.get("status").searchOne({ code: req.params.code.trim() }).then((status) => {
						container.get("servers.web").sendValidJSONResponse(req, res, status);
					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/status/searchone] " + err);
							
					});
						
				}

			});

		})

	);

};
