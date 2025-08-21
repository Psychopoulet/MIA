// types & interfaces

    // externals
    import type { Request } from "express";

// module

export default function getRequestPath (req: Request): string {

    return "[" + req.method + "]" + req.protocol + "://" + req.hostname + (req.path.length ? req.path : "");

}
