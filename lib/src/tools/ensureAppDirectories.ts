// deps

	// natives
	import { stat, mkdir } from "node:fs";

// types & interfaces

	// natives
	import type { Stats } from "node:fs";

    // externals
	import type ContainerPattern from "node-containerpattern";

    // locals
    import type { iLogger } from "./generateLogger";

// module

export default function ensureAppDirectories (container: ContainerPattern): Promise<void> {

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

            (container.get("log") as iLogger).warning("App data directory not detected, create one at " + dataDir);

            return mkdir(dataDir, {
                "recursive": true
            }, (err: Error | null): void => {
                return err ? reject(err) : resolve();
            });

        });

    });

}
