
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/users", (req, res) => {

			container.get("users").search().then((users) => {
				container.get("servers.web").sendValidJSONResponse(res, users);
			}).catch((err) => {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "users-search-catch", message: err } ]);
				container.get("logs").err("-- [database/users/search] " + err);
					
			});

		}).post("/api/users/login", (req, res) => {

			if (!req.body) {
				container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "users-login-010", message: "Il n'y a aucune donnée de connexion" } ]);
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

				container.get("servers.web").sendWrongRequestJSONResponse(res, errors);

			}
			else {

				container.get("users").searchOne({
					login: req.body.login,
					password: req.body.password
				}).then((user) => {

					if (!user) {
						container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "users-login-040", message: "Cet utilisateur n'existe pas" } ]);
					}
					else {

						container.get("devicestypes").searchOne({ code: "WEB" }).then((devicetype) => {

							if (!devicetype) {
								container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "users-login-042", message: "Ce type de périphérique n'existe pas" } ]);
							}
							else {

								container.get("status").searchOne({ code: "ACCEPTED" }).then((status) => {

									if (!user) {
										container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "users-login-043", message: "Ce statut n'existe pas" } ]);
									}
									else {

										container.get("devices").add({
											status: status,
											type: devicetype,
											user: user,
											name: "Inconnu"
										}).then((device) => {
											container.get("servers.web").sendValidJSONResponse(res, device);
										}).catch((err) => {

											err = (err.message) ? err.message : err;

											container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "users-login-catch", message: err } ]);
											container.get("logs").err("-- [database/devices/add] " + err);
												
										});
										
									}

								}).catch((err) => {
									
									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "users-login-catch", message: err } ]);
									container.get("logs").err("-- [database/status/searchone] " + err);
							
								});
						
							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "users-login-catch", message: err } ]);
							container.get("logs").err("-- [database/devicestypes/searchone] " + err);
					
						});
								
					}

				}).catch((err) => {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, [ { code: "users-login-catch", message: err } ]);
					container.get("logs").err("-- [database/users/searchone] " + err);
					
				});

			}

		})

	);

};
