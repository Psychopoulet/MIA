
module.exports = (container) => {

	return container.get("servers.app")

	.get("/test", (req, res) => {

		container.get("servers.web").sendJSONResponse(res, 200, "test");

	}).get("/api", (req, res) => {

		container.get("servers.web").sendJSONResponse(res, 200, "api");

	});

};
