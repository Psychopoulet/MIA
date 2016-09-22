
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/conditions", (req, res) => {

			container.get("conditions").search().then(function(conditions) {

				container.get("servers.web").sendValidJSONResponse(req, res, conditions);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
				container.get("logs").err("-- [database/conditions/search] " + err);

			});

		})

	);

};
