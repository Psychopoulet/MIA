
"use strict";

// deps

	const path = require("path");

// module

module.exports = (container) => {

	require(path.join(__dirname, "childs.js"))(container);
	require(path.join(__dirname, "clients.js"))(container);
	require(path.join(__dirname, "crons.js"))(container);
	require(path.join(__dirname, "status.js"))(container);
	require(path.join(__dirname, "users.js"))(container);

	container.get("servers.web").connection((socket) => {

		console.log("connection");

	});

	return container.get("servers.app");

};
