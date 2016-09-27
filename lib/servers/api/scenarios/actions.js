
"use strict";

module.exports = (container) => {

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/actions", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					container.get("actions").search().then(function(actions) {

						container.get("servers.web").sendValidJSONResponse(req, res, actions);

					}).catch(function(err) {

						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/actions/search] " + err);

					});

				});

			}).get("/api/actions/:code", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "actions-searchone-020", message: "Il manque l'action" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "actions-searchone-021", message: "L'action n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "actions-searchone-022", message: "Le code de l'action est vide" } ]);
							}
					else {

						container.get("actions").searchOne({ code: req.params.code.trim() }).then((cron) => {
							container.get("servers.web").sendValidJSONResponse(req, res, cron);
						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/actions/searchone] " + err);
								
						});
							
					}

				});

			})

		);

};
