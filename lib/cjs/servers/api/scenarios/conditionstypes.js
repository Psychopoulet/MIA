
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/conditionstypes", (req, res) => {

			container.get("conditionstypes").search().then(function(conditionstypes) {

				container.get("servers.web").sendValidJSONResponse(req, res, conditionstypes);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
				container.get("logs").err("-- [database/conditionstypes/search] " + err);

			});

		})

	);

};
