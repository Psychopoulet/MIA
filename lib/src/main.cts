
// deps

	// natives

	import { join } from "node:path";

    // externals

	import ContainerPattern from "node-containerpattern";
	import ConfManager from "node-confmanager";
	import Pluginsmanager from "node-pluginsmanager";

// run

	new Promise((resolve): void => {

		const container: ContainerPattern = new ContainerPattern();

		container	.set("conf", new ConfManager(join(__dirname, "conf.json")))
					.set("logs", new (require("node-logs"))(_logDir))
					.set("plugins", new Pluginsmanager(join(__dirname, "plugins")))
					.set("servers", {
						"app": require("express")(),
						"web": new (require(join(__dirname, "servers", "Web.js")))(container)
					});

		return resolve(container);

	}).then((container: ContainerPattern): void => {

		// conf
		_loadConf(container).then(() => {

			container.get("logs").showInConsole = container.get("conf").get("debug");
			container.get("logs").showInFiles = true;

			if (!container.get("conf").get("debug")) {
				process.env.NODE_ENV = "production";
			}

			// logs
			_deleteOldLogs(container.get("logs")).then(() => {

				// database
				_loadDatabase(container).then(() => {

					// process
					if (container.get("conf").has("pid")) {

						try {

							process.kill(container.get("conf").get("pid"));
							container.get("logs").success("[END PROCESS " + container.get("conf").get("pid") + "]");

						}
						catch (e) {
							// nothing to do here
						}

					}

					container.get("conf").set("pid", process.pid).save().then(() => {

						// plugins
						container.get("plugins")

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

	}).catch((err: Error): void => {

		console.error("Global script failed");
		console.error(err);

	});
