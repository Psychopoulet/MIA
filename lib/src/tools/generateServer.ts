// deps

	// natives
    import { createServer as createServer } from "node:http";
	import { join } from "node:path";

    // externals
    import ContainerPattern from "node-containerpattern";
    import compression from "compression";
    import cors from "cors";
    import express from "express";
    import helmet from "helmet";
	import ConfManager from "node-confmanager";

	// locals
    import getRequestPath from "./getRequestPath";

// types & interfaces

    // externals
    import type { Express, Request, Response, NextFunction } from "express";

    // locals
    import type { iLogger } from "./generateLogger";

// module

export default function generateServer (container: ContainerPattern): Promise<void> {

    return new Promise((resolve: () => void): void => {

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

            resolve();

        });

    });

}
