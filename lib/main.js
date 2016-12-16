"use strict";

// deps

	const 	path = require("path"),
			fs = require("node-promfs");

// private

	// attrs

		var _logDir = path.join(__dirname, "logs");

	// methods

	function _loadConf(Container) {

		Container.get("conf")
			.bindSkeleton("ports", "object")
				.bindSkeleton("ports.http", "integer")
				.bindSkeleton("ports.https", "integer")
			.bindSkeleton("debug", "boolean")
			.bindSkeleton("ssl", "boolean");

		return fs.isFileProm(path.join(__dirname, "conf.json")).then((exists) => {

			Container.get("conf").spaces = true;

			if (exists) {
				return Promise.resolve();
			}
			else {

				return Container.get("conf")
					.set("ports", {})
						.set("ports.http", 80)
						.set("ports.https", 443)
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

			for (const [key, value] of scenariosContainer) {
				Container.set(key, value);
			}

			Container	.set("controllers", new (require(path.join(dirDatabase, "controllers.js")))(Container))
						.set("controllersfunctions", new (require(path.join(dirDatabase, "controllersfunctions.js")))(Container))
						.set("controllerstypes", new (require(path.join(dirDatabase, "controllerstypes.js")))(Container))
						.set("crons", new (require(path.join(dirDatabase, "crons.js")))(Container))
						.set("status", new (require(path.join(dirDatabase, "status.js")))(Container))
						.set("users", new (require(path.join(dirDatabase, "users.js")))(Container));

			return Promise.resolve();

		}).then(() => {

			// vérification de l'existance de la DB de MIA

			return new Promise((resolve, reject) => {

				Container.get("db").all("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", [], (err, rows) => {

					if (err) {
						reject(err);
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

					// création des types de condition

					return Container.get("conditionstypes").add({ code: "HOUR_EQUAL", "name" : "Heure égale à" }).then((conditiontype) => {

						return Container.get("conditions").bindExecuter(conditiontype, (condition) => {

							if (!condition) {
								return Promise.reject("HOUR_EQUAL/executer : Il n'y a pas de condition");
							}
							else if (!condition.value) {
								return Promise.reject("HOUR_EQUAL/executer : Il n'y a pas de valeur à cette condition");
							}
							else if (!condition.value.hour) {
								return Promise.reject("HOUR_EQUAL/executer : Il n'y a pas d'heure à cette condition");
							}
							else if (!condition.value.minute) {
								return Promise.reject("HOUR_EQUAL/executer : Il n'y a pas de minute à cette condition");
							}
							else {
								return Promise.resolve(d.getHours() == condition.value.hour && d.getMinutes() == condition.value.minute);
							}

						}).then(() => {

							return Container.get("conditions").add({
								"type": conditiontype,
								"name": "12:30",
								"value": { hour: 12, minute: 30 }

							});

						}).then(() => {

							return Container.get("conditions").add({
								"type": conditiontype,
								"name": "16:00",
								"value": { hour: 16, minute: 0 }

							});

						});
						
					}).then(() => {
						return Container.get("conditionstypes").add({ code: "PERIOD_WEEK", "name" : "Période de la semaine" });
					}).then((conditiontype) => {

						return Container.get("conditions").bindExecuter(conditiontype, (condition) => {

							if (!condition) {
								return Promise.reject("PERIOD_WEEK/executer : Il n'y a pas de condition");
							}
							else if (!condition.value) {
								return Promise.reject("PERIOD_WEEK/executer : Il n'y a pas de valeur à cette condition");
							}
							else if (!condition.value.days || !(condition.value.days instanceof Array)) {
								return Promise.reject("PERIOD_WEEK/executer : Il n'y a pas de jours liés à cette condition");
							}
							else {
								return Promise.resolve(-1 < condition.value.days.indexOf(d.getDay()));
							}

						}).then(() => {

							return Container.get("conditions").add({
								"type": conditiontype,
								"name": "Semaine",
								"value": [1, 2, 3, 4, 5]

							});

						}).then(() => {

							return Container.get("conditions").add({
								"type": conditiontype,
								"name": "Week-end",
								"value": [6, 0]
							});

						});

					});

				}).then(() => {

					// création des données principales des contrôleurs

					return Container.get("controllersfunctions").add({
						code: "CLIENT",
						name: "client",
						icon: "users"
					}).then((CLIENT) => {

						return Container.get("controllerstypes").add({
							function: CLIENT,
							code: "WEB",
							name: "navigateur",
							icon: "desktop"
						}).then(() => {

							return Container.get("controllerstypes").add({
								function: CLIENT,
								code: "MOBILE",
								name: "téléphone",
								icon: "mobile"
							});
							
						}).then(() => {

							return Container.get("controllerstypes").add({
								function: CLIENT,
								code: "DESKTOP",
								name: "ordinateur",
								icon: "desktop"
							});
							
						});
						
					}).then(() => {

						return Container.get("controllersfunctions").add({
							code: "CHILD",
							name: "enfant",
							icon: "fa-sitemap"
						}).then((CHILD) => {

							return Container.get("controllerstypes").add({
								function: CHILD,
								code: "CHILD",
								name: "classique",
								icon: "camera"
							});
							
						});

					});

				}).then(() => {

					// création de l"utilisateur principal

					return Container.get("users").add({
						login: "admin",
						password: "password",
						email: ""
					});

				}).then((mainuser) => {

					// création des triggers

					return Container.get("triggers").add({
						code: "CRONS",
						name: "Tâches plannifiées"
					}).then((trigger) => {

						// création des crons

						return Container.get("crons").add({
							trigger: trigger,
							user: mainuser,
							code: "MANGER",
							name: "Manger !!",
							timer: {
								second : "00",
								minute : "30",
								hour : "12",
								monthday : "*",
								month : "*",
								weekday : "1-5"
							}
						}).then(() => {

							return Container.get("crons").add({
								trigger: trigger,
								user: mainuser,
								code: "CAFE",
								name: "Café !!",
								timer: {
									second : "00",
									minute : "00",
									hour : "16",
									monthday : "*",
									month : "*",
									weekday : "1-5"
								}
							});

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

		return fs.isDirectoryProm(_logDir).then((exists) => {

			if (!exists) {
				return Promise.resolve();
			}
			else {

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

		});

	}

// run

	try {

		let Container = new (require("node-containerpattern"))();

		Container	.set("conf", new (require("node-confmanager"))(path.join(__dirname, "conf.json")))
					.set("logs", new (require("node-logs"))(_logDir))
					.set("plugins", new (require("node-pluginsmanager"))(path.join(__dirname, "plugins")))
					.set("openssl", new (require("simplessl"))())
					.set("servers", {
						"app": require("express")(),
						"web": new (require(path.join(__dirname, "servers", "Web.js")))(Container)
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

							// servers web
							Container.get("servers.web").start().then(() => {
								
								Container.get("logs").log("").then(() => {
									Container.get("logs").success("[MIA started]");
								});

							}).catch((err) => {
								Container.get("logs").err("-- [servers web] => " + ((err.message) ? err.message : err));
							});

						}).catch((err) => {
							Container.get("logs").err("-- [plugins] => " + ((err.message) ? err.message : err));
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
	