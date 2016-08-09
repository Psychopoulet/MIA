
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/actionstypes", (req, res) => {

			container.get("actionstypes").search().then(function(actionstypes) {

				container.get("servers.web").sendValidJSONResponse(res, actionstypes);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/actionstypes/search] " + err);

			});

		})

	);

};
