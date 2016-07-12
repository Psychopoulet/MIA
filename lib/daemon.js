"use strict";

// run

try {

	new (require("forever-monitor").Monitor)(require("path").join(__dirname, "main.js"), {
		silent: true,
		max: 4,
		killTree: true,
		command: "node",
		args: (2 < process.argv.length) ? process.argv.slice(2) : []
	})

	.on("exit", function () {
		(1, console).log("MIA has exited after 4 restarts");
	}).on("stderr", function (err) {
		(1, console).log(err.toString());
	})

	.start();

}
catch(e) {
	(1, console).log(e);
}
