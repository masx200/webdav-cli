#!/usr/bin/env node
import process from "process";

import minimist from "minimist";
import { WebdavCli } from "./webdav-cli.server";
import { showhelp } from "./showhelp";
// import { HOMEPAGE } from './webdav-cli.constants';

const argv = minimist(process.argv.slice(2));

console.log("webdav-cli", "\n");
if (argv.help || argv.h) {
    showhelp();
}

if (argv.version || argv.v) {
    console.log("Version: " + require("../package.json").version, "\n");
    process.exit();
}

const argvRights =
    argv.rights && typeof argv.rights === "string"
        ? argv.rights.split(",")
        : undefined;
const envRights = process.env.WEBDAV_CLI_RIGHTS
    ? process.env.WEBDAV_CLI_RIGHTS.split(",")
    : undefined;

const config = {
    path: argv.path || process.env.WEBDAV_CLI_PATH,
    host: argv.host || process.env.WEBDAV_CLI_HOST,
    port: argv.port || parseInt(String(process.env.WEBDAV_CLI_PORT)),
    digest: argv.digest || Boolean(process.env.WEBDAV_CLI_DIGEST),
    username: argv.username || process.env.WEBDAV_CLI_USERNAME,
    password: argv.password || process.env.WEBDAV_CLI_PASSWORD,

    ssl: argv.ssl || Boolean(process.env.WEBDAV_CLI_SSL),
    sslKey: argv.sslKey || process.env.WEBDAV_CLI_SSL_KEY,
    sslCert: argv.sslCert || process.env.WEBDAV_CLI_SSL_CERT,
    disableAuthentication:
        argv.disableAuthentication ||
        process.env.WEBDAV_CLI_DISABLE_AUTHENTICATION,
    rights: (argvRights || envRights) as any,
};

const run = async () => {
    const webdavCli = new WebdavCli(config);

    //  console.log(webdavCli.config);
    await webdavCli.start();
};

run();
process.on("unhandledRejection", (e) => {
    console.error(e);
});
