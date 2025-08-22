// deps

    // externals
	import winston from "winston";

// types & interfaces

    // externals
	import type ConfManager from "node-confmanager";
	import type ContainerPattern from "node-containerpattern";

    // local

    export interface iLogger {
        "critical": Function,
        "error": Function,
        "warning": Function,
        "success": Function,
        "info": Function,
        "debug": Function
    }

// module

export default function generateLogger (container: ContainerPattern): void {

    const logger = winston.createLogger({

        "level": (container.get("conf") as ConfManager).get("debug") as boolean ? "debug" : "info",

        "transports": [
            new winston.transports.File({
                "filename": container.get("logs-file") as string,
                "format": winston.format.combine(
                    winston.format.timestamp(),
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
            "format": winston.format.combine(
                winston.format.colorize({
                    "level": true
                }),
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp }) => {

                    return `${timestamp} ${level}: ${message}`;

                })
            )
        }));

    }

    container.set("log", logger);

}
