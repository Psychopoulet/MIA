
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

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/users/search] " + err);
					
			});

		})

	);

};
