
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/actions", (req, res) => {

			container.get("actions").search().then(function(actions) {

				container.get("servers.web").sendValidJSONResponse(req, res, actions);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
				container.get("logs").err("-- [database/actions/search] " + err);

			});

		})

	);

};
