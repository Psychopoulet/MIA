"use strict";
// types & interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getRequestPath;
// module
function getRequestPath(container, req) {
    return "[" + req.method + "]" + req.protocol + "://" + req.hostname + ":" + container.get("conf").get("port") + (req.path.length ? req.path : "");
}
