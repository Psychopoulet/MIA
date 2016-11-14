"use strict";

// run

try {

	let args = (2 < process.argv.length) ? process.argv.slice(2) : [];

	args.unshift(require("path").join(__dirname, "main.js"));

	new (require("node-persistent-software"))("node", args).on("error", function () {
		(1, console).log("MIA thrown an error", error);
	}).on("firststart", function () {
		(1, console).log("MIA has started for the first time");
	}).on("restart", function () {
		(1, console).log("MIA has restarted");
	}).on("stop", function () {
		(1, console).log("MIA was stopped");
	}).on("end", function (err) {
		(1, console).log("MIA was stopped 4 time, and will not restart");
	}).max(4).start();

}
catch(e) {
	(1, console).log(e);
}
