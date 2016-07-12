"use strict";

// deps

	const 	path = require("path"),
			fs = require("node-promfs");

// private

	function _loadConf(Container) {

		return fs.isFileProm(path.join(__dirname, "conf.json")).then(function(exists) {

			Container.get("conf").spaces = true;

			if (exists) {
				return Promise.resolve();
			}
			else {

				return Container.get("conf").set("ports", {
					"clients": { "http": 80, "https": 443 },
					"children": { "http": 1337, "https": 1338 }
				}).set("debug", false).set("ssl", true).save();

			}

		}).then(function() {
			return Container.get("conf").load();
		});

	}

	function _executeQueries(db, queries, i) {

		if (i >= queries.length) {
			return Promise.resolve();
		}
		else {

			return new Promise(function(resolve, reject) {

				db.run(queries[i], [], function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						_executeQueries(db, queries, i + 1).then(function() {
							resolve();
						}).catch(reject);

					}

				});

			});

		}

	}

	function _executeSQLFile(db, file) {

		return fs.readFileProm(file, "utf8").then(function (sql) {

			let queries = [];
			sql.split(";").forEach(function(query) {

				query = query.trim()
							.replace(/--(.*)\s/g, "")
							.replace(/\s/g, " ")
							.replace(/[ ]{2}/g, " ");

				if ("" != query) {
					queries.push(query + ";");
				}

			});

			return _executeQueries(db, queries, 0);

		});

	}

	function _loadDatabase(Container) {

		let createFile = path.join(__dirname, "..", "database", "create.sql");

		// création de la DB de node-scenarios

		return require("node-scenarios").init(path.join(__dirname, "..", "database", "MIA.sqlite3")).then(function(container) {

			let db = container.get("db");

			container.forEach(function(value, key) {
				Container.set(key, value);
			});

			Container	.set("childs", new (require(path.join(__dirname, "..", "database", "childs.js")))(db))
						.set("clients", new (require(path.join(__dirname, "..", "database", "clients.js")))(db))
						.set("crons", new (require(path.join(__dirname, "..", "database", "crons.js")))(db))
						.set("status", new (require(path.join(__dirname, "..", "database", "status.js")))(db))
						.set("users", new (require(path.join(__dirname, "..", "database", "users.js")))(db));

			return Promise.resolve();

		}).then(function() {

			// vérification de l"existance de la DB de MIA

			return new Promise(function(resolve, reject) {

				Container.get("db").all("SELECT name, type FROM sqlite_master WHERE type='table' AND name='users';", [], function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(0 < rows.length);
					}

				});

			});

		}).then(function(MIADatabaseCreated) {

			if (MIADatabaseCreated) {
				return Promise.resolve();
			}
			else {

				// création de la DB de MIA

				return _executeSQLFile(Container.get("db"), createFile).then(function() {

					// création des types d"action

					return Container.get("actionstypes").add({
						code: "PLAYSOUNDONCHILD",
						name: "Jouer un son sur un enfant"
					}).then(function() {

						return Container.get("actionstypes").add({
							code: "PLAYVIDEOONCHILD",
							name: "Jouer une vidéo sur un enfant"
						});

					}).then(function() {

						return Container.get("actionstypes").add({
							code: "READTEXTONCHILD",
							name: "Lire un texte sur un enfant"
						});

					});

				}).then(function() {

					// création de l"utilisateur principal

					return Container.get("users").add({
						login: "rasp",
						password: "d74bc8c7cb18433b140785ae51c48c77b4dc2208"
					});

				}).then(function(mainuser) {

					// création des crons de base

					return Container.get("crons").add({
						user: mainuser,
						name: "Café !!",
						timer: "00 00 16 * * 1-5"
					}).then(function() {

						return Container.get("crons").add({
							user: mainuser,
							name: "Manger !!",
							timer: "00 30 12 * * 1-5"
						});

					});

				}).then(function() {

					// création des status de base

					return Container.get("status").add({
						code: "ACCEPTED",
						name: "Accepté(e)",
						backgroundcolor: "#dff0d8",
						textcolor: "#3c763d"
					}).then(function() {

						return Container.get("status").add({
							code: "BLOCKED",
							name: "Bloqué(e)",
							backgroundcolor: "red",
							textcolor: "black"
						});

					}).then(function() {

						return Container.get("status").add({
							code: "WAITING",
							name: "En attente",
							backgroundcolor: "#fcf8e3",
							textcolor: "#8a6d3b"
						});

					});

				});

			}

		}).catch(function(err) {

			return require("node-scenarios").delete().then(function() {
				return Promise.reject(err);
			}).then(function() {
				return Promise.reject(err);
			});

		});

	}

	function _deleteOldLogs(Logs) {

		return Logs.getLogs().then(function(logs) {

			let date = new Date(),
				sYear = date.getFullYear(), sMonth = date.getMonth() + 1, sDay = date.getDate();

				sYear = sYear + "";
				sMonth = (9 < sMonth) ? sMonth + "" : "0" + sMonth;
				sDay = (9 < sDay) ? sDay + "" : "0" + sDay;

			for (let _year in logs) {

				for (let _month in logs[_year]) {

					for (let _day in logs[_year][_month]) {

						if (_year != sYear || _month != sMonth) {

							Logs.remove(_year, _month, logs[_year][_month][_day]).catch(function(err) {
								Logs.err((err.message) ? err.message : err);
							});

						}

					}

				}

			}

			return Promise.resolve();

		});

	}

// run

	try {

		let Container = new (require("node-containerpattern"))();

		Container	.set("conf", new (require("node-confmanager"))(path.join(__dirname, "conf.json")))
					.set("logs", new (require("simplelogs"))(path.join(__dirname, "..", "logs")))
					.set("plugins", new (require("node-pluginsmanager"))(path.join(__dirname, "..", "plugins")))
					.set("openssl", new (require("simplessl"))())
					.set("servers", {
						"clients": {
							"web": new (require(path.join(__dirname, "..", "servers", "ClientsWeb.js")))(Container),
							"sockets": new (require(path.join(__dirname, "..", "servers", "ClientsSockets.js")))(Container)
						},
						"children": {
							"sockets": new (require(path.join(__dirname, "..", "servers", "ChildrenSockets.js")))(Container)
						}
					});

		// conf
		_loadConf(Container).then(function() {

			Container.get("logs").showInConsole = Container.get("conf").get("debug");
			Container.get("logs").showInFiles = true;

			if (!Container.get("conf").get("debug")) {
				process.env.NODE_ENV = "production";
			}

			// logs
			_deleteOldLogs(Container.get("logs")).then(function() {

				// database
				_loadDatabase(Container).then(function() {

					// process
					if (Container.get("conf").has("pid")) {

						try {

							process.kill(Container.get("conf").get("pid"));
							Container.get("logs").success("[END PROCESS " + Container.get("conf").get("pid") + "]");

						}
						catch (e) {
							// nothing to do here
						}

					}

					Container.get("conf").set("pid", process.pid).save().then(function() {

						// servers
						Container.get("servers.clients.web").start().then(function() {

							// plugins
							Container.get("plugins")

								// error
								.on("error", function (err) {
									Container.get("logs").err("-- [plugins] : " + err);
								})

								// load
								.on("loaded", function(plugin) {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") loaded");
								}).on("allloaded", function() {
									Container.get("logs").success("-- [plugins] : all loaded");
								}).on("unloaded", function(plugin) {
									Container.get("logs").info("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") unloaded");
								})

								// write
								.on("installed", function(plugin) {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") installed");
								}).on("updated", function(plugin) {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") updated");
								}).on("uninstalled", function(plugin) {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") uninstalled");
								})

							// load
							.loadAll(Container).then(function() {
								return Container.get("logs").log("");
							}).then(function() {

								// MIA
								new (require(path.join(__dirname, "MIA.js")))(Container).start().then(function() {

									Container.get("logs").log("").then(function() {
										Container.get("logs").success("[MIA started]");
									});

								}).catch(function (err) {
									Container.get("logs").err("-- [MIA] => " + ((err.message) ? err.message : err));
								});

							}).catch(function (err) {
								Container.get("logs").err("-- [plugins] => " + ((err.message) ? err.message : err));
							});

						}).catch(function (err) {
							Container.get("logs").err("-- [servers] => " + ((err.message) ? err.message : err));
						});

					}).catch(function(err) {
						Container.get("logs").err("-- [process] => " + ((err.message) ? err.message : err));
					});
				
				}).catch(function(err) {
					Container.get("logs").err("-- [database] => " + ((err.message) ? err.message : err));
				});

			}).catch(function(err) {
				Container.get("logs").err("-- [logs] => " + ((err.message) ? err.message : err));
			});
	
		}).catch(function(err) {
			Container.get("logs").err("-- [conf] => " + ((err.message) ? err.message : err));
		});

	}
	catch (e) {
		(1, console).log("Global script failed : " + ((e.message) ? e.message : e));
	}
	