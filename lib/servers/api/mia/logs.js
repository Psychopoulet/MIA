
"use strict";

module.exports = (container) => {

	container.set(

		"servers.app",

		container.get("servers.app").get("/api/logs", (req, res) => {

			container.get("logs").getLogs().then(function(logs) {

				container.get("servers.web").sendValidJSONResponse(res, logs);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/logs/get] " + err);

			});

		}).get("/api/logs/:year", (req, res) => {

			container.get("logs").getLogs().then(function(logs) {

				if (logs[req.params.year]) {
					container.get("servers.web").sendValidJSONResponse(res, logs[req.params.year]);
				}
				else {
					container.get("servers.web").sendValidJSONResponse(res, null);
				}

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/logs/get/" + req.params.year + "] " + err);

			});

		}).get("/api/logs/:year/:month", (req, res) => {

			container.get("logs").getLogs().then(function(logs) {

				if (logs[req.params.year] && logs[req.params.year][req.params.month]) {
					container.get("servers.web").sendValidJSONResponse(res, logs[req.params.year][req.params.month]);
				}
				else {
					container.get("servers.web").sendValidJSONResponse(res, null);
				}

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/logs/get/" + req.params.year + "/" + req.params.month + "] " + err);

			});

		}).get("/api/logs/:year/:month/:day", (req, res) => {

			container.get("logs").getLogs().then(function(logs) {

				if (logs[req.params.year] && logs[req.params.year][req.params.month] && logs[req.params.year][req.params.month][req.params.day]) {
					container.get("servers.web").sendValidJSONResponse(res, logs[req.params.year][req.params.month][req.params.day]);
				}
				else {
					container.get("servers.web").sendValidJSONResponse(res, null);
				}

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorJSONResponse(res, err);
				container.get("logs").err("-- [database/logs/get/" + req.params.year + "/" + req.params.month + "/" + req.params.day + "] " + err);

			});

		}).get("/api/logs/:year/:month/:day/:number", (req, res) => {

			container.get("logs").read(req.params.year, req.params.month, req.params.day, req.params.number).then(function(HTMLLogs) {

				container.get("servers.web").sendValidHTMLResponse(res, HTMLLogs);

			}).catch(function(err) {

				err = (err.message) ? err.message : err;

				container.get("servers.web").sendInternalErrorHTMLResponse(res, err);
				container.get("logs").err("-- [database/logs/get/" + req.params.year + "/" + req.params.month + "/" + req.params.day + "/" + req.params.number + "] " + err);

			});

		})

	);

};
