
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/triggers", (req, res) => {

			container.get("triggers").search().then(function(triggers) {

				container.get("servers.web").sendValidJSONResponse(res, triggers);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/triggers/search] " + err);

			});

		})

	);

};
