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

	}).then((): Promise<void> => {

		return new Promise((resolve: (content: { "name": string; "version": string; "description": string; }) => void, reject: (err: Error) => void): void => {

			const packageFile: string = join(__dirname, "..", "..", "package.json");

			return readFile(packageFile, "utf-8", (err: Error | null, content: string): void => {
				return err ? reject(err) : resolve(JSON.parse(content));
			});

		}).then((packageData: { "name": string; "version": string; "description": string; }): void => {

			container.skeleton("app", "object");
			container.skeleton("app.name", "string").set("app.name", packageData.name);
			container.skeleton("app.version", "string").set("app.version", packageData.version);
			container.skeleton("app.description", "string").set("app.description", packageData.description);

			container.skeleton("data-directory", "string").set("data-directory", join(homedir(), container.get("app.name") as string, "data"));
			container.skeleton("plugins-directory", "string").set("plugins-directory", join(homedir(), container.get("app.name") as string, "plugins"));

		});

	}).then((): Promise<void> => {

		// generate data directory

		const dataDir: string = container.get("data-directory") as string;

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

		});

	// generate and load conf file

	}).then((): Promise<void> => {

		const confFile: string = join(container.get("data-directory") as string, "conf.json");

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

	// load plugins

	}).then((): Promise<void> => {

		if (!(container.get("conf") as ConfManager).get("debug")) {
			process.env.NODE_ENV = "production";
		}

		const pluginsManager: Pluginsmanager = new Pluginsmanager({
			"directory": container.get("plugins-directory") as string,
			"externalRessourcesDirectory": container.get("data-directory") as string,
			"logger": container.get("log")
		});

			container.set("plugins", pluginsManager);

			pluginsManager.on("error", (err: Error): void => {
				container.get("logs").error(err);
			}).on("allloaded", (): void => {
				container.get("log").success("All plugins loaded");
			}).on("allinitialized", (): void => {
				container.get("log").success("All plugins initialized");
			});

			// loading
			// loaded
			// (v) allloaded

			// initializing
			// initialized
			// (v) allinitialized

			// updated

			// installed
			// uninstalled

			// released
			// allreleased

			// destroyed
			// alldestroyed

			/*
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
			*/

		return pluginsManager.loadAll(container).then((): Promise<void> => {
			return pluginsManager.initAll(container);
		});

	}).then((): void => {

		// @WIP
		container.get("log").warning("server web : WIP");

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
