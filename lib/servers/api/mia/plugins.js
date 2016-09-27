
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/plugins", (req, res) => {

			container.get("servers.web").sendValidJSONResponse(req, res, container.get("plugins").plugins);

		}).get("/api/plugins/:name", (req, res) => {

			if ("object" !== typeof req.params) {
				container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-searchone-020", message: "Il manque les données de plugin" } ]);
			}
				else if ("string" !== typeof req.params.name) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-searchone-021", message: "Il manque le nom" } ]);
				}
			else {

				let plugins = container.get("plugins").plugins, result = null;

					for(let i = 0; i < plugins.length; ++i) {

						if (plugins[i].name === req.params.name) {
							result = plugins[i];
							break;
						}
						
					}

				container.get("servers.web").sendValidJSONResponse(req, res, result);

			}

		}).put("/api/plugins", (req, res) => {

			if ("object" !== typeof req.body) {
				container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-add-020", message: "Il manque les données de plugin" } ]);
			}
				else if ("string" !== typeof req.body.url) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-add-021", message: "Il manque l'url" } ]);
				}
				else if ("" === req.body.url.trim()) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-add-022", message: "L'url du plugin est vide" } ]);
				}
				else if ("string" !== typeof req.body.origin) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-add-023", message: "Il manque l'origine" } ]);
				}
				else if ("" === req.body.origin.trim()) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-add-024", message: "L'origine du plugin est vide" } ]);
				}
			else {

				if ("github" !== req.body.origin) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-add-30", message: "L'origine du plugin n'est pas gérée" } ]);
				}
				else {

					container.get("plugins").installViaGithub(req.body.url, container).then((plugin) => {
						container.get("servers.web").sendValidJSONResponse(req, res, plugin);
					}).catch((err) => {

						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [plugins/installviagithub] " + err);

					});

					
				}

			}

		}).post("/api/plugins/:name", (req, res) => {

			if ("object" !== typeof req.params) {
				container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-update-020", message: "Il manque les données de plugin" } ]);
			}
				else if ("string" !== typeof req.params.name) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-update-021", message: "Il manque le nom" } ]);
				}
			else {

				let plugins = container.get("plugins").plugins, result = null;

					for(let i = 0; i < plugins.length; ++i) {

						if (plugins[i].name === req.params.name) {
							result = plugins[i];
							break;
						}
						
					}

				if (!result) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-update-030", message: "Ce plugin n'existe pas" } ]);
				}
				else {

					container.get("plugins").update(result).then((plugin) => {
						container.get("servers.web").sendValidJSONResponse(req, res, plugin);
					}).catch((err) => {

						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [plugins/update] " + err);

					});
					
				}

			}

		}).delete("/api/plugins/:name", (req, res) => {

			if ("object" !== typeof req.params) {
				container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-delete-020", message: "Il manque les données de plugin" } ]);
			}
				else if ("string" !== typeof req.params.name) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-delete-021", message: "Il manque le nom" } ]);
				}
			else {

				let plugins = container.get("plugins").plugins, result = null;

					for(let i = 0; i < plugins.length; ++i) {

						if (plugins[i].name === req.params.name) {
							result = plugins[i];
							break;
						}
						
					}

				if (!result) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "plugins-delete-30", message: "Ce plugin n'existe pas" } ]);
				}
				else {

					container.get("plugins").uninstall(result).then(() => {
						container.get("servers.web").sendValidJSONResponse(req, res);
					}).catch((err) => {

						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [plugins/uninstall] " + err);

					});
					
				}

			}

		})

	);

};
