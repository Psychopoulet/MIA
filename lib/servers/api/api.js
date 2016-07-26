
"use strict";

// deps

	const path = require("path");

// module

module.exports = (container) => {

	require(path.join(__dirname, "childs.js"))(container);
	require(path.join(__dirname, "clients.js"))(container);
	require(path.join(__dirname, "users.js"))(container);

	return container.get("servers.app");

};
