// deps

    // externals
	import ContainerPattern from "node-containerpattern";
	import Pluginsmanager from "node-pluginsmanager";

// types & interfaces

    // externals
	import type { Orchestrator } from "node-pluginsmanager-plugin";

    // locals
    import type { iLogger } from "./generateLogger";

// module

export default function managePlugins (container: ContainerPattern): Promise<void> {

    const logger: iLogger = container.get("log") as iLogger;

    const pluginsManager: Pluginsmanager = new Pluginsmanager({
        "directory": container.get("plugins-directory") as string,
        "externalRessourcesDirectory": container.get("data-directory") as string,
        "logger": logger as any
    });

        container.set("plugins", pluginsManager);

        pluginsManager.on("error", (err: Error): void => {
            logger.error(err.message);
            logger.debug(err.stack as string);
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

}
