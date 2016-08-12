
"use strict";

// deps

	const	path = require("path"),
			bodyParser = require('body-parser');

// module

module.exports = (container) => {

	container.set(
		"servers.app",
		container.get("servers.app")
			.use(bodyParser.json())
			.use(bodyParser.urlencoded({ extended: false }))
	);

	require(path.join(__dirname, "scenarios", "actions.js"))(container);
	require(path.join(__dirname, "scenarios", "actionstypes.js"))(container);
	require(path.join(__dirname, "scenarios", "conditions.js"))(container);
	require(path.join(__dirname, "scenarios", "conditionstypes.js"))(container);
	require(path.join(__dirname, "scenarios", "scenarios.js"))(container);
	require(path.join(__dirname, "scenarios", "triggers.js"))(container);

	require(path.join(__dirname, "mia", "crons.js"))(container);
	require(path.join(__dirname, "mia", "devices.js"))(container);
	require(path.join(__dirname, "mia", "logs.js"))(container);
	require(path.join(__dirname, "mia", "plugins.js"))(container);
	require(path.join(__dirname, "mia", "status.js"))(container);
	require(path.join(__dirname, "mia", "users.js"))(container);

	return container.get("servers.app");

};
