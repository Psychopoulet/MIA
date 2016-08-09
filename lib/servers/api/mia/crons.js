
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/crons", (req, res) => {

			container.get("crons").search().then((crons) => {

				container.get("servers.web").sendValidJSONResponse(res, crons);

			}).catch((err) => {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/crons/search] " + err);

			});

		})

	);

};
