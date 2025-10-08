
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/users", (req, res) => {

			container.get("users").search().then((users) => {
				container.get("servers.web").sendValidJSONResponse(req, res, users);
			}).catch((err) => {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(req, res, [ { code: "users-search-catch", message: err } ]);
				container.get("logs").err("-- [database/users/search] " + err);
					
			});

		}).post("/api/users/login", (req, res) => {

			container.get("servers.web").checkAPI_userAllowedOrWaiting(req, res).then((myController) => {

				if (!req.body) {
					container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "users-login-010", message: "Il n'y a aucune donnée" } ]);
				}
				else if ("string" !== typeof req.body.login || "" === req.body.login.trim() || "string" !== typeof req.body.password || "" === req.body.password.trim()) {

					let errors = [];

						if ("string" !== typeof req.body.login) {
							errors.push({ code: "users-login-020", message: "Il manque le login" });
						}
							else if ("" === req.body.login.trim()) {
								errors.push({ code: "users-login-021", message: "Le login est vide" });
							}

						if ("string" !== typeof req.body.password || "" === req.body.password.trim()) {
							errors.push({ code: "users-login-030", message: "Il manque le mot de passe" });
						}
							else if ("" === req.body.password.trim()) {
								errors.push({ code: "users-login-031", message: "Le mot de passe est vide" });
							}

					container.get("servers.web").sendWrongRequestJSONResponse(req, res, errors);

				}
				else {

					container.get("users").searchOne({
						login: req.body.login.trim(),
						password: req.body.password.trim()
					}).then((user) => {

						if (!user) {
							container.get("servers.web").sendNotLoggedJSONResponse(req, res, "Cet utilisateur n'existe pas");
						}
						else {

							container.get("status").searchOne({ code: "ACCEPTED" }).then((status) => {

								if (!status) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "users-login-050", message: "Ce statut n'existe pas" } ]);
								}
								else {

									myController.status = status;
									myController.user = user;

									container.get("controllers").edit(myController).then((myController) => {
										container.get("servers.web").sendValidJSONResponse(req, res, myController);
									}).catch((err) => {

										err = (err.message) ? err.message : err;

										container.get("servers.web").sendInternalErrorJSONResponse(req, res, [ { code: "users-login-catch", message: err } ]);
										container.get("logs").err("-- [database/controllers/edit] " + err);
											
									});
									
								}

							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								container.get("servers.web").sendInternalErrorJSONResponse(req, res, [ { code: "users-login-catch", message: err } ]);
								container.get("logs").err("-- [database/status/searchone] " + err);
						
							});
					
						}

					}).catch((err) => {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, [ { code: "users-login-catch", message: err } ]);
						container.get("logs").err("-- [database/users/searchone] " + err);
						
					});

				}

			}).catch((err) => {
				container.get("logs").warn("-- [rights] " + ((err.message) ? err.message : err));
			});

		})

	);

};
