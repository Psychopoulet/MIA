// deps

    // externals
	import winston from "winston";

// types & interfaces

    // externals
	import type ConfManager from "node-confmanager";
	import type ContainerPattern from "node-containerpattern";

    // local

    export interface iLogger {
        "critical": (content: string) => void,
        "error": (content: string) => void,
        "warning": (content: string) => void,
        "success": (content: string) => void,
        "info": (content: string) => void,
        "debug": (content: string) => void
    }

// module

export default function generateLogger (container: ContainerPattern): void {

    const logger = winston.createLogger({

        "transports": [
            new winston.transports.File({
                "level": (container.get("conf") as ConfManager).get("debug") as boolean ? "debug" : "info",
                "filename": container.get("logs-file") as string,
                "format": winston.format.combine(
                    winston.format.timestamp({
                        "format": "YYYY-MM-DD HH:mm:ss",
                    }),
                    winston.format.json()
                )
            })
        ],

        "levels": {
            "critical": 0,
            "error": 1,
            "warning": 2,
            "success": 3,
            "info": 4,
            "debug": 5
        }

    });

    winston.addColors({
        "critical": "bold red",
        "error": "red",
        "warning": "yellow",
        "success": "green",
        "info": "blue"
    });

    if ((container.get("conf") as ConfManager).get("debug") as boolean) {

        logger.add(new winston.transports.Console({
            "level": "debug",
            "format": winston.format.combine(
                winston.format.timestamp({
                    "format": "YYYY-MM-DD HH:mm:ss",
                }),
                winston.format.colorize({
                    "level": true
                }),
                winston.format.printf(({ level, message, timestamp }) => {
                    return timestamp + " " + level + ": " + message;
                })
            )
        }));

    }

    container.set("log", logger);

}
