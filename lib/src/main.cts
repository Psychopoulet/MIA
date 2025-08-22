// deps

	// natives
    import { createServer as createServer } from "node:http";
	import { join } from "node:path";

    // externals

    import compression from "compression";
    import cors from "cors";
    import express from "express";
    import helmet from "helmet";
	import ConfManager from "node-confmanager";
	import ContainerPattern from "node-containerpattern";
	import Pluginsmanager from "node-pluginsmanager";

	// locals
    import getRequestPath from "./tools/getRequestPath";
    import registerAppData from "./tools/registerAppData";
    import ensureAppDirectories from "./tools/ensureAppDirectories";
    import generateConf from "./tools/generateConf";
    import generateLogger from "./tools/generateLogger";

// types & interfaces

    // externals
	import type { Orchestrator } from "node-pluginsmanager-plugin";
    import type { Express, Request, Response, NextFunction } from "express";

	// locals
	import type { iLogger } from "./tools/generateLogger";

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

		return registerAppData(container);

	// ensure app directories

	}).then((): Promise<void> => {

		return ensureAppDirectories(container);

	// generate and load conf file

	}).then((): Promise<void> => {

		return generateConf(container);

	// generate advanced logger

	}).then((): void => {

		return generateLogger(container);

	// load plugins

	}).then((): Promise<void> => {

		if (!(container.get("conf") as ConfManager).get("debug") as boolean) {
			process.env.NODE_ENV = "production";
		}

		const logger: iLogger = container.get("log") as iLogger;

		const pluginsManager: Pluginsmanager = new Pluginsmanager({
			"directory": container.get("plugins-directory") as string,
			"externalRessourcesDirectory": container.get("data-directory") as string,
			"logger": logger as any
		});

			container.set("plugins", pluginsManager);

			pluginsManager.on("error", (err: Error): void => {
				logger.error(err);
			})

			.on("loaded", (plugin: Orchestrator): void => {
				logger.debug("Plugin " + plugin.name + " (v" + plugin.version + ") loaded");
			}).on("allloaded", (): void => {
				logger.success("All plugins loaded");
			})

			.on("initialized", (plugin: Orchestrator): void => {
				logger.debug("Plugin " + plugin.name + " (v" + plugin.version + ") initialized");
			}).on("allinitialized", (): void => {
				logger.success("All plugins initialized");
			})

			.on("released", (plugin: Orchestrator): void => {
				logger.debug("Plugin " + plugin.name + " (v" + plugin.version + ") released");
			}).on("allreleased", (): void => {
				logger.warning("All plugins released");
			})

			.on("released", (plugin: Orchestrator): void => {
				logger.debug("Plugin " + plugin.name + " (v" + plugin.version + ") released");
			}).on("allreleased", (): void => {
				logger.warning("All plugins released");
			})

			.on("destroyed", (plugin: Orchestrator): void => {
				logger.warning("Plugin " + plugin.name + " (v" + plugin.version + ") destroyed");
			}).on("alldestroyed", (): void => {
				logger.warning("All plugins destroyed");
			})

			.on("updated", (plugin: Orchestrator): void => {
				logger.success("Plugin " + plugin.name + " (v" + plugin.version + ") success");
			})

			.on("installed", (plugin: Orchestrator): void => {
				logger.success("Plugin " + plugin.name + " (v" + plugin.version + ") installed");
			}).on("uninstalled", (plugin: Orchestrator): void => {
				logger.warning("Plugin " + plugin.name + " (v" + plugin.version + ") uninstalled");
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

            (container.get("log") as iLogger).warning(getRequestPath(req) + " not found");

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

		createServer(app).listen((container.get("conf") as ConfManager).get("port") as number, (): void => {
            (container.get("log") as iLogger).success("started on port " + (container.get("conf") as ConfManager).get("port"));
        });

	}).catch((err: Error): void => {

		if (container && container.has("log")) {

			(container.get("log") as iLogger).error("Global script failed");
			(container.get("log") as iLogger).error(err);

		}
		else {

			console.error("Global script failed");
			console.error(err);

		}

        process.exitCode = 1;
        process.exit(1);

	});
