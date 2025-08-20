// deps

	// natives
	import { stat, readFile, mkdir } from "node:fs";
	import { homedir } from "node:os";
	import { join } from "node:path";

    // externals
	import ContainerPattern from "node-containerpattern";
	import ConfManager from "node-confmanager";
	import Pluginsmanager from "node-pluginsmanager";

// types & interfaces

	import type { Stats } from "node:fs";

// consts

	const container: ContainerPattern = new ContainerPattern();

// run

	// generate logger

	Promise.resolve().then((): void => {

		container.set("log", {
			"debug": console.debug,
			"info": console.info,
			"success": console.log,
			"warning": console.warn,
			"error": console.error
		});

	}).then((): Promise<{ "name": string; }> => {

		return new Promise((resolve: (content: { "name": string; }) => void, reject: (err: Error) => void): void => {

			const packageFile: string = join(__dirname, "..", "..", "package.json");

			return readFile(packageFile, "utf-8", (err: Error | null, content: string): void => {
				return err ? reject(err) : resolve(JSON.parse(content));
			});

		});

	}).then((packageData: { "name": string; }): Promise<void> => {

		// generate data directory

		const dataDir: string = join(homedir(), packageData.name, "data");
		const pluginsDir: string = join(homedir(), packageData.name, "plugins");

		return new Promise((resolve: (result: boolean) => void): void => {

			return stat(dataDir, (err: Error | null, stats: Stats): void => {
				return err || !stats.isDirectory() ? resolve(false) : resolve(true);
			});

		}).then((result: boolean): Promise<void> => {

			return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

				if (result) {
					return resolve();
				}

				container.get("log").warning("App data directory not detected, create one at", dataDir);

				return mkdir(dataDir, {
					"recursive": true
				}, (err: Error | null): void => {
					return err ? reject(err) : resolve();
				});

			});

		// generate and load conf file

		}).then((): Promise<void> => {

			const confFile: string = join(dataDir, "conf.json");

			const confManager: ConfManager = new ConfManager(confFile);

				container.set("conf", confManager);

				confManager.skeleton("port", "integer");
				confManager.skeleton("debug", "boolean");

			return confManager.fileExists().then((exists: boolean): Promise<void> => {

				if (!exists) {

					container.get("log").warning("Conf file not detected, create one at", confFile);

					confManager.set("port", 8000);
					confManager.set("debug", true);

					return confManager.save();

				}
				else {
					return confManager.load();
				}

			});

		}).then((): Promise<void> => {

			if (!container.get("conf").get("debug")) {
				process.env.NODE_ENV = "production";
			}

			const pluginsManager: Pluginsmanager = new Pluginsmanager({
				"directory": pluginsDir,
				"externalRessourcesDirectory": dataDir,
				"logger": container.get("log")
			});

				container.set("plugins", pluginsManager);

			return pluginsManager.loadAll(container).then((): Promise<void> => {

				container.get("log").success("All plugins loaded");

				return pluginsManager.initAll(container).then(() => {
					container.get("log").success("All plugins initialized");
				});

			});

		});

		/*

		container	.set("plugins", new Pluginsmanager(join(__dirname, "plugins")))
					.set("servers", {
						"app": require("express")(),
						"web": new (require(join(__dirname, "servers", "Web.js")))(container)
					});

		return resolve(container);

	}).then((container: ContainerPattern): void => {

		// conf
		_loadConf(container).then(() => {

			// logs
			_deleteOldLogs(container.get("logs")).then(() => {

				// database
				_loadDatabase(container).then(() => {

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
					Container.get("logs").err("-- [database] => " + ((err.message) ? err.message : err));
				});

			}).catch((err) => {
				Container.get("logs").err("-- [logs] => " + ((err.message) ? err.message : err));
			});

		}).catch((err) => {
			Container.get("logs").err("-- [conf] => " + ((err.message) ? err.message : err));
		});*/

	}).catch((err: Error): void => {

		if (container && container.has("log")) {

			container.get("log").error("Global script failed");
			container.get("log").error(err);

		}
		else {

			console.error("Global script failed");
			console.error(err);

		}

	});
