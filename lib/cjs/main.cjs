"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// externals
const node_containerpattern_1 = __importDefault(require("node-containerpattern"));
// locals
const registerAppData_1 = __importDefault(require("./tools/registerAppData"));
const ensureAppDirectories_1 = __importDefault(require("./tools/ensureAppDirectories"));
const generateConf_1 = __importDefault(require("./tools/generateConf"));
const generateLogger_1 = __importDefault(require("./tools/generateLogger"));
const managePlugins_1 = __importDefault(require("./tools/managePlugins"));
const generateServer_1 = __importDefault(require("./tools/generateServer"));
// consts
const container = new node_containerpattern_1.default();
// run
// generate basic logger
Promise.resolve().then(() => {
    container
        .set("log", {
        "debug": console.debug,
        "info": console.info,
        "success": console.log,
        "warning": console.warn,
        "error": console.error
    })
        .document("log", "App logger");
    // register app data
}).then(() => {
    return (0, registerAppData_1.default)(container);
    // ensure app directories
}).then(() => {
    return (0, ensureAppDirectories_1.default)(container);
    // generate and load conf file
}).then(() => {
    return (0, generateConf_1.default)(container);
    // generate advanced logger
}).then(() => {
    return (0, generateLogger_1.default)(container);
    // log basic data
}).then(() => {
    container.get("log").success(container.get("app.name") + " (v" + container.get("app.version") + ")");
    container.get("log").debug("conf file : " + container.get("conf-file"));
    container.get("log").debug("logs file : " + container.get("logs-file"));
    // load plugins
}).then(() => {
    return (0, managePlugins_1.default)(container);
    // create server
}).then(() => {
    return (0, generateServer_1.default)(container);
    // fail to run
}).catch((err) => {
    if (container && container.has("log")) {
        container.get("log").error("Global script failed");
        container.get("log").error(err.message);
        container.get("log").debug(err.stack);
    }
    else {
        console.error("Global script failed");
        console.error(err);
    }
    process.exitCode = 1;
    process.exit(1);
});
