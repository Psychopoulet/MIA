
"use strict";

// deps

	const path = require("path");

// module

module.exports = (container) => {

	require(path.join(__dirname, "devices.js"))(container);
	require(path.join(__dirname, "crons.js"))(container);
	require(path.join(__dirname, "status.js"))(container);
	require(path.join(__dirname, "users.js"))(container);

	container.get("servers.web").connection(() => {

		(1, console).log("connection");

	});

	return container.get("servers.app");

};
