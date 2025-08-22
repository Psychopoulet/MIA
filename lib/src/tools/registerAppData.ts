// deps

	// natives
	import { readFile } from "node:fs";
	import { homedir } from "node:os";
	import { join } from "node:path";

// types & interfaces

    // externals
	import type ContainerPattern from "node-containerpattern";

// module

export default function registerAppData (container: ContainerPattern): Promise<void> {

    return new Promise((resolve: (content: { "name": string; "version": string; "description": string; }) => void, reject: (err: Error) => void): void => {

        const packageFile: string = join(__dirname, "..", "..", "..", "package.json");

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

        container.skeleton("conf-file", "string").set("conf-file", join(container.get("data-directory") as string, "conf.json"));
        container.skeleton("logs-file", "string").set("logs-file", join(container.get("data-directory") as string, "logs.txt"));

    });

}
