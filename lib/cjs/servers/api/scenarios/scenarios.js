
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/scenarios", (req, res) => {

			container.get("scenarios").search().then(function(scenarios) {

				container.get("servers.web").sendValidJSONResponse(req, res, scenarios);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
				container.get("logs").err("-- [database/scenarios/search] " + err);

			});

		})

	);

};
