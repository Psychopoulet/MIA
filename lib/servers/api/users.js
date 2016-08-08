
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/users", (req, res) => {

			container.get("users").last().then(function(user) {

				delete user.password;

				container.get("servers.web").sendValidJSONResponse(res, [user]);

			}).catch(function(err) {
				
				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/users/last] " + err);
					
			});

		})

	);

};
