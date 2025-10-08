"use strict";
// types & interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getRequestPath;
// module
function getRequestPath(req) {
    return "[" + req.method + "]" + req.protocol + "://" + req.hostname + (req.path.length ? req.path : "");
}
