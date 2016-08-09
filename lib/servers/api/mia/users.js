
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/users", (req, res) => {

			container.get("users").search().then(function(users) {

				users.forEach(function (client, i) {
					delete users[i].password;
				});

				container.get("servers.web").sendValidJSONResponse(res, users);

			}).catch(function(err) {
				
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
							errors.push({ code: "users-login-031", message: "Le mote de passe est vide" });
						}

				container.get("servers.web").sendWrongRequestJSONResponse(res, errors);

			}
			else {

				container.get("servers.web").sendWrongRequestJSONResponse(res, [ { code: "users-login-undone", message: "Procédure en cours de création" } ]);

				/*container.get("users").exists(req.body.login, req.body.password).then(function(exists) {

					if (exists) {

					}
					else {

					}

					users.forEach(function (client, i) {
						delete users[i].password;
					});

					container.get("servers.web").sendValidJSONResponse(res, users);

				}).catch(function(err) {
					
					err = (err.message) ? err.message : err;

					container.get("servers.web").sendInternalErrorJSONResponse(res, err);
					container.get("logs").err("-- [database/users/search] " + err);
						
				});

					container.get("users").search().then(function(users) {

						users.forEach(function (client, i) {
							delete users[i].password;
						});

						container.get("servers.web").sendValidJSONResponse(res, users);

					}).catch(function(err) {
						
						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(res, err);
						container.get("logs").err("-- [database/users/search] " + err);
							
					});

				})*/
				
			}

		})

	);

};
