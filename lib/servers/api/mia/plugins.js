
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/plugins", (req, res) => {

			container.get("servers.web").sendValidJSONResponse(res, container.get("plugins").plugins);

		})

	);

};
