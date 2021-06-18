#!/usr/bin/env node
"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const minimist_1 = __importDefault(require("minimist"));
const webdav_cli_server_1 = require("./webdav-cli.server");
const showhelp_1 = require("./showhelp");
const argv = minimist_1.default(process_1.default.argv.slice(2));
console.log("webdav-cli", "\n");
if (argv.help || argv.h) {
    showhelp_1.showhelp();
}
if (argv.version || argv.v) {
    console.log("Version: " + require("../package.json").version, "\n");
    process_1.default.exit();
}
const argvRights =
    argv.rights && typeof argv.rights === "string"
        ? argv.rights.split(",")
        : undefined;
const envRights = process_1.default.env.WEBDAV_CLI_RIGHTS
    ? process_1.default.env.WEBDAV_CLI_RIGHTS.split(",")
    : undefined;
const config = {
    path: argv.path || process_1.default.env.WEBDAV_CLI_PATH,
    host: argv.host || process_1.default.env.WEBDAV_CLI_HOST,
    port: argv.port || parseInt(String(process_1.default.env.WEBDAV_CLI_PORT)),
    digest: argv.digest || Boolean(process_1.default.env.WEBDAV_CLI_DIGEST),
    username: argv.username || process_1.default.env.WEBDAV_CLI_USERNAME,
    password: argv.password || process_1.default.env.WEBDAV_CLI_PASSWORD,
    ssl: argv.ssl || Boolean(process_1.default.env.WEBDAV_CLI_SSL),
    sslKey: argv.sslKey || process_1.default.env.WEBDAV_CLI_SSL_KEY,
    sslCert: argv.sslCert || process_1.default.env.WEBDAV_CLI_SSL_CERT,
    disableAuthentication:
        argv.disableAuthentication ||
        process_1.default.env.WEBDAV_CLI_DISABLE_AUTHENTICATION,
    rights: argvRights || envRights,
};
const run = async () => {
    const webdavCli = new webdav_cli_server_1.WebdavCli(config);
    await webdavCli.start();
};
run();
process_1.default.on("unhandledRejection", (e) => {
    console.error(e);
});
