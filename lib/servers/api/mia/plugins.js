
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/plugins", (req, res) => {

			container.get("servers.web").sendValidJSONResponse(res, container.get("plugins").plugins);

		}).put("/api/plugins", (req, res) => {

			if ("object" !== typeof req.body) {
				container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "plugins-add-020", message: "Il manque les données de plugin" } ]);
			}
				else if ("string" !== typeof req.body.url) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "plugins-add-021", message: "Il manque l'url" } ]);
				}
				else if ("" === req.body.url.trim()) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "plugins-add-022", message: "L'url du plugin est vide" } ]);
				}
				else if ("string" !== typeof req.body.origin) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "plugins-add-023", message: "Il manque l'origine" } ]);
				}
				else if ("" === req.body.origin.trim()) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "plugins-add-024", message: "L'origine du plugin est vide" } ]);
				}
			else {

				if ("github" !== req.body.origin) {
					container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "plugins-add-30", message: "L'origine du plugin n'est pas gérée" } ]);
				}
				else {

					container.get("plugins").installViaGithub(req.body.url).then((plugin) => {

						container.get("servers.web").sendValidJSONResponse(res, plugin);

					}).catch((err) => {

						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, err);
						container.get("logs").err("-- [plugins/installviagithub] " + err);

					});

					
				}

			}

		})

	);

};
