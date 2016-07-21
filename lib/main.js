"use strict";

// deps

	const 	path = require("path"),
			fs = require("node-promfs");

// private

	function _loadConf(Container) {

		return fs.isFileProm(path.join(__dirname, "conf.json")).then((exists) => {

			Container.get("conf").spaces = true;

			if (exists) {
				return Promise.resolve();
			}
			else {

				return Container.get("conf")
					.set("ports", {
						"http": 80, "https": 443
					})
					.set("debug", false)
					.set("ssl", true)
					.save();

			}

		}).then(() => {
			return Container.get("conf").load();
		});

	}

	function _loadDatabase(Container) {

		let dirDatabase = path.join(__dirname, "database");

		// création de la DB de node-scenarios

		return require("node-scenarios").init(path.join(dirDatabase, "MIA.sqlite3")).then((scenariosContainer) => {

			scenariosContainer.forEach((value, key) => {
				Container.set(key, value);
			});

			Container	.set("childs", new (require(path.join(dirDatabase, "childs.js")))(Container))
						.set("clients", new (require(path.join(dirDatabase, "clients.js")))(Container))
						.set("crons", new (require(path.join(dirDatabase, "crons.js")))(Container))
						.set("status", new (require(path.join(dirDatabase, "status.js")))(Container))
						.set("users", new (require(path.join(dirDatabase, "users.js")))(Container));

			return Promise.resolve();

		}).then(() => {

			// vérification de l'existance de la DB de MIA

			return new Promise((resolve, reject) => {

				Container.get("db").all("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", [], (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(0 < rows.length);
					}

				});

			});

		}).then((MIADatabaseCreated) => {

			if (MIADatabaseCreated) {
				return Promise.resolve();
			}
			else {

				// création de la DB de MIA

				return new Promise((resolve, reject) => {

					Container.get("db").execFileTrans(path.join(dirDatabase, "create.sql"), (err) => {

						if (err) {
							reject(err);
						}
						else {
							resolve();
						}

					});

				}).then(() => {

					// création des types d'action

					return Container.get("actionstypes").add({
						code: "PLAYSOUNDONCHILD",
						name: "Jouer un son sur un enfant"
					}).then(() => {

						return Container.get("actionstypes").add({
							code: "PLAYVIDEOONCHILD",
							name: "Jouer une vidéo sur un enfant"
						});

					}).then(() => {

						return Container.get("actionstypes").add({
							code: "READTEXTONCHILD",
							name: "Lire un texte sur un enfant"
						});

					});

				}).then(() => {

					// création de l"utilisateur principal

					return Container.get("users").add({
						login: "rasp",
						password: "d74bc8c7cb18433b140785ae51c48c77b4dc2208",
						email: ""
					});

				}).then((mainuser) => {

					// création des crons de base

					return Container.get("crons").add({
						user: mainuser,
						name: "Café !!",
						timer: "00 00 16 * * 1-5"
					}).then(() => {

						return Container.get("crons").add({
							user: mainuser,
							name: "Manger !!",
							timer: "00 30 12 * * 1-5"
						});

					});

				}).then(() => {

					// création des status de base

					return Container.get("status").add({
						code: "ACCEPTED",
						name: "Accepté(e)",
						colors: {
							background: "#dff0d8",
							text: "#3c763d"
						}
					}).then(() => {

						return Container.get("status").add({
							code: "BLOCKED",
							name: "Bloqué(e)",
							colors: {
								background: "red",
								text: "black"
							}
						});

					}).then(() => {

						return Container.get("status").add({
							code: "WAITING",
							name: "En attente",
							colors: {
								background: "#fcf8e3",
								text: "#8a6d3b"
							}
						});

					});

				});

			}

		}).catch((err) => {

			return require("node-scenarios").delete().then(() => {
				return Promise.reject(err);
			}).then(() => {
				return Promise.reject(err);
			});

		});

	}

	function _deleteOldLogs(Logs) {

		return Logs.getLogs().then((logs) => {

			let date = new Date(),
				sYear = date.getFullYear(), sMonth = date.getMonth() + 1, sDay = date.getDate();

				sYear = sYear + "";
				sMonth = (9 < sMonth) ? sMonth + "" : "0" + sMonth;
				sDay = (9 < sDay) ? sDay + "" : "0" + sDay;

			for (let _year in logs) {

				for (let _month in logs[_year]) {

					for (let _day in logs[_year][_month]) {

						if (_year != sYear || _month != sMonth) {

							Logs.remove(_year, _month, logs[_year][_month][_day]).catch((err) => {
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
					.set("plugins", new (require("node-pluginsmanager"))(path.join(__dirname, "plugins")))
					.set("openssl", new (require("simplessl"))())
					.set("servers", {
						"app": require("express")(),
						"web": new (require(path.join(__dirname, "servers", "Web.js")))(Container),
						"sockets": new (require(path.join(__dirname, "servers", "Sockets.js")))(Container)
					});

		// conf
		_loadConf(Container).then(() => {

			Container.get("logs").showInConsole = Container.get("conf").get("debug");
			Container.get("logs").showInFiles = true;

			if (!Container.get("conf").get("debug")) {
				process.env.NODE_ENV = "production";
			}

			// logs
			_deleteOldLogs(Container.get("logs")).then(() => {

				// database
				_loadDatabase(Container).then(() => {

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

					Container.get("conf").set("pid", process.pid).save().then(() => {

						// servers
						Container.get("servers.web").start().then(() => {

							// plugins
							Container.get("plugins")

								// error
								.on("error",  (err) => {
									Container.get("logs").err("-- [plugins] : " + err);
								})

								// load
								.on("loaded", (plugin) => {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") loaded");
								}).on("allloaded", () => {
									Container.get("logs").success("-- [plugins] : all loaded");
								}).on("unloaded", (plugin) => {
									Container.get("logs").info("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") unloaded");
								})

								// write
								.on("installed", (plugin) => {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") installed");
								}).on("updated", (plugin) => {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") updated");
								}).on("uninstalled", (plugin) => {
									Container.get("logs").success("-- [plugins] : " + plugin.name + " (v" + plugin.version + ") uninstalled");
								})

							// load
							.loadAll(Container).then(() => {

								// MIA
								new (require(path.join(__dirname, "MIA.js")))(Container).start().then(() => {

									Container.get("logs").log("").then(() => {
										Container.get("logs").success("[MIA started]");
									});

								}).catch((err) => {
									Container.get("logs").err("-- [MIA] => " + ((err.message) ? err.message : err));
								});

							}).catch((err) => {
								Container.get("logs").err("-- [plugins] => " + ((err.message) ? err.message : err));
							});

						}).catch((err) => {
							Container.get("logs").err("-- [servers] => " + ((err.message) ? err.message : err));
						});

					}).catch((err) => {
						Container.get("logs").err("-- [process] => " + ((err.message) ? err.message : err));
					});
				
				}).catch((err) => {
					Container.get("logs").err("-- [database] => " + ((err.message) ? err.message : err));
				});

			}).catch((err) => {
				Container.get("logs").err("-- [logs] => " + ((err.message) ? err.message : err));
			});
	
		}).catch((err) => {
			Container.get("logs").err("-- [conf] => " + ((err.message) ? err.message : err));
		});

	}
	catch (e) {
		(1, console).log("Global script failed : " + ((e.message) ? e.message : e));
	}
	