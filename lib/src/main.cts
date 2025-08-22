// deps

    // externals
	import ContainerPattern from "node-containerpattern";

	// locals
    import registerAppData from "./tools/registerAppData";
    import ensureAppDirectories from "./tools/ensureAppDirectories";
    import generateConf from "./tools/generateConf";
    import generateLogger from "./tools/generateLogger";
    import managePlugins from "./tools/managePlugins";
    import generateServer from "./tools/generateServer";

// types & interfaces

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

		return managePlugins(container);

	// create server

	}).then((): Promise<void> => {

		return generateServer(container);

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
