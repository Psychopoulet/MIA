// deps

	// natives
    import { readFile } from "node:fs";
    import { createServer } from "node:http";
	import { join } from "node:path";

    // externals
    import compression from "compression";
    import cors from "cors";
    import express from "express";
    import helmet from "helmet";
    import { WebSocketServer } from "ws";

	// locals
    import getRequestPath from "./getRequestPath";

// types & interfaces

	// natives
    import type { Server } from "node:http";

    // externals
    import type { Express, Request, Response, NextFunction } from "express";
	import type ConfManager from "node-confmanager";
    import type ContainerPattern from "node-containerpattern";
	import type Pluginsmanager from "node-pluginsmanager";
    import type { WebSocket } from "ws";

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

        app.get([ "/", "/public/index.html" ], (req: Request, res: Response, next: NextFunction): void => {

            const file: string = join(__dirname, "..", "..", "..", "public", "index.html");

            readFile(file, "utf-8", (err: Error | null, content: string): void => {

                if (err) {
                    return next(err);
                }

                res.status(200).send(content
                        .replace(/{{app.name}}/g, container.get("app.name") as string)
                        .replace(/{{app.version}}/g, container.get("app.version") as string)
                        .replace(/{{app.description}}/g, container.get("app.description") as string)
                );

            });

        }).get("/public/bundle.js", (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "public", "bundle.js"));
        });

        // libs

        app.get("/public/libs/bootstrap.min.css", (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css"));
        }).get("/public/libs/bootstrap.min.css.map", (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css.map"));
        })

        .get("/public/libs/bootstrap.min.js", (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "node_modules", "bootstrap", "dist", "js", "bootstrap.min.js"));
        }).get("/public/libs/bootstrap.min.js.map", (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "node_modules", "bootstrap", "dist", "js", "bootstrap.min.js.map"));
        })

        .get("/public/libs/fontawesome.min.css", (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "node_modules", "@fortawesome", "fontawesome-free", "css", "fontawesome.min.css"));
        });

        // pictures

        app.get([ "favicon.ico", "/favicon.ico", "/public/pictures/favicon.ico" ], (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "public", "pictures", "favicon.ico"));
        }).get([ "favicon.png", "/favicon.png", "/public/pictures/favicon.png" ], (req: Request, res: Response): void => {
            return res.sendFile(join(__dirname, "..", "..", "..", "public", "pictures", "favicon.png"));
        });

        // link to plugins

        app.use((req: Request, res: Response, next: NextFunction): void => {
            (container.get("plugins-manager") as Pluginsmanager).appMiddleware(req, res, next);
        });

        // not found

        app.use((req: Request, res: Response, next: NextFunction): void => {

            (container.get("log") as iLogger).warning(getRequestPath(container, req) + " not found");

            if (res.headersSent) {
                return next("Not found");
            }
            else {

                res.status(404).json({
                    "code": 404,
                    "message": getRequestPath(container, req) + " not found"
                });

            }

        });

        // create http server

        const server: Server = createServer(app);

        // create socket server

        const wss: WebSocketServer = new WebSocketServer({
            "server": server
        });

        wss.on("error", (err: Error): void => {
            (container.get("log") as iLogger).error(err.message);
        }).on("connection", (ws: WebSocket): void => {

            (container.get("log") as iLogger).debug("Socket created");

            ws.on("error", (err: Error): void => {
                (container.get("log") as iLogger).error(err.message);
            });

            ws.on("close", (code: number, reason: Buffer): void => {

                if (code) {
                    (container.get("log") as iLogger).warning("Socket closed with code " + code + " (reason : " + reason.toString("utf-8") + ")");
                }
                else {
                    (container.get("log") as iLogger).debug("Socket closed");
                }

            });

        });

        container
            .set("socket", wss)
            .document("socket", "Socket server");

        // run http server

        server.listen((container.get("conf") as ConfManager).get("port") as number, (): void => {

            (container.get("log") as iLogger).success("started on port " + (container.get("conf") as ConfManager).get("port"));

            resolve();

        });

    });

}
