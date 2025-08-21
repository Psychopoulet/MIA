// deps

	// natives
	import { stat, readFile, mkdir } from "node:fs";
    import { createServer as createServer } from "node:http";
	import { homedir } from "node:os";
	import { join } from "node:path";

    // externals

    import compression from "compression";
    import cors from "cors";
    import express from "express";
    import helmet from "helmet";
	import ContainerPattern from "node-containerpattern";
	import ConfManager from "node-confmanager";
	import Pluginsmanager from "node-pluginsmanager";

	// locals
    import getRequestPath from "./tools/getRequestPath";

// types & interfaces

	// natives
    import type { Server } from "node:http";
	import type { Stats } from "node:fs";

    // externals
	import type { Orchestrator } from "node-pluginsmanager-plugin";
    import type { Express, Request, Response, NextFunction } from "express";

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

	// register app data

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

	// ensure app directories

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
			})

			.on("loaded", (plugin: Orchestrator): void => {
				container.get("log").debug("Plugin " + plugin.name + " (v" + plugin.version + ") loaded");
			}).on("allloaded", (): void => {
				container.get("log").success("All plugins loaded");
			})

			.on("initialized", (plugin: Orchestrator): void => {
				container.get("log").debug("Plugin " + plugin.name + " (v" + plugin.version + ") initialized");
			}).on("allinitialized", (): void => {
				container.get("log").success("All plugins initialized");
			})

			.on("released", (plugin: Orchestrator): void => {
				container.get("log").debug("Plugin " + plugin.name + " (v" + plugin.version + ") released");
			}).on("allreleased", (): void => {
				container.get("log").warning("All plugins released");
			})

			.on("released", (plugin: Orchestrator): void => {
				container.get("log").debug("Plugin " + plugin.name + " (v" + plugin.version + ") released");
			}).on("allreleased", (): void => {
				container.get("log").warning("All plugins released");
			})

			.on("destroyed", (plugin: Orchestrator): void => {
				container.get("log").warning("Plugin " + plugin.name + " (v" + plugin.version + ") destroyed");
			}).on("alldestroyed", (): void => {
				container.get("log").warning("All plugins destroyed");
			})

			.on("updated", (plugin: Orchestrator): void => {
				container.get("log").success("Plugin " + plugin.name + " (v" + plugin.version + ") success");
			})

			.on("installed", (plugin: Orchestrator): void => {
				container.get("log").success("Plugin " + plugin.name + " (v" + plugin.version + ") installed");
			}).on("uninstalled", (plugin: Orchestrator): void => {
				container.get("log").warning("Plugin " + plugin.name + " (v" + plugin.version + ") uninstalled");
			});

		return pluginsManager.loadAll(container).then((): Promise<void> => {
			return pluginsManager.initAll(container);
		});

	// create server

	}).then((): void => {

		// create app

		const app: Express = express()
			.use(cors())
			.use(helmet({
				"contentSecurityPolicy": false
			}))
			.use(compression());

		// basic roots

		app.get([ "/", "/public/index.html" ], (req: Request, res: Response): void => {
			return res.sendFile(join(__dirname, "..", "..", "public", "index.html"));
		});

		// pictures

		app.get([ "favicon.ico", "/favicon.ico", "/public/pictures/favicon.ico" ], (req: Request, res: Response): void => {
			return res.sendFile(join(__dirname, "..", "..", "public", "pictures", "favicon.ico"));
		}).get([ "favicon.png", "/favicon.png", "/public/pictures/favicon.png" ], (req: Request, res: Response): void => {
			return res.sendFile(join(__dirname, "..", "..", "public", "pictures", "favicon.png"));
		});

		// not found

        app.use((req: Request, res: Response, next: NextFunction): void => {

            container.get("log").warning(getRequestPath(req) + " not found");

            if (res.headersSent) {
                return next("Not found");
            }
            else {

                res.status(404).json({
                    "code": 404,
                    "message": getRequestPath(req) + " not found"
                });

            }

        });

		const server: Server = createServer(app);

        server.listen((container.get("conf") as ConfManager).get("port"), (): void => {
            container.get("log").success("started on port " + (container.get("conf") as ConfManager).get("port"));
        });

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
