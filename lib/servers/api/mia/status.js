
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/status", (req, res) => {

			container.get("status").search().then(function(status) {

				container.get("servers.web").sendValidJSONResponse(res, status);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/status/search] " + err);

			});

		})

	);

};
