import process from "process";
import minimist from "minimist";
import { WebdavCli } from "./webdav-cli.server.js";
import { showhelp } from "./showhelp.js";
import { WebdavCliConfig } from "./webdav-cli.interfaces.js";

export async function main(
    argv: Partial<WebdavCliConfig & minimist.ParsedArgs>,
) {
    console.log("webdav-cli", "\n");
    if (argv.help || argv.h) {
        showhelp();
    }
    // if (argv.version || argv.v) {
    //     console.log("Version: " + require("../package.json").version, "\n");
    //     process.exit();
    // }
    const rights = argv.rights || argv.r;
    const argvRights =
        rights && typeof rights === "string" ? rights.split(",") : undefined;
    const envRights = process.env.WEBDAV_CLI_RIGHTS
        ? process.env.WEBDAV_CLI_RIGHTS.split(",")
        : undefined;
    const config = {
        path: argv.path || process.env.WEBDAV_CLI_PATH || argv.pa,
        host: argv.host || process.env.WEBDAV_CLI_HOST || argv.ho,
        port:
            Number(argv.port || argv.po) ||
            parseInt(String(process.env.WEBDAV_CLI_PORT)),
        digest:
            argv.digest || argv.dg || Boolean(process.env.WEBDAV_CLI_DIGEST),
        username: argv.username || process.env.WEBDAV_CLI_USERNAME || argv.u,
        password: argv.password || process.env.WEBDAV_CLI_PASSWORD || argv.ps,
        ssl: argv.ssl || argv.s || Boolean(process.env.WEBDAV_CLI_SSL),
        sslKey: argv.sslKey || process.env.WEBDAV_CLI_SSL_KEY,
        sslCert: argv.sslCert || process.env.WEBDAV_CLI_SSL_CERT,
        disableAuthentication:
            argv.disableAuthentication ||
            process.env.WEBDAV_CLI_DISABLE_AUTHENTICATION ||
            argv.da,
        rights: argvRights || envRights,
        methodsWithoutAuthentication:
            "string" === typeof argv.methodsWithoutAuthentication
                ? String(argv.methodsWithoutAuthentication).split(",")
                : Array.isArray(argv.methodsWithoutAuthentication)
                ? argv.methodsWithoutAuthentication
                : undefined,
    };
    process.on("unhandledRejection", (e) => {
        console.error(e);
        throw e;
    });
    const run = async () => {
        //@ts-ignore
        const webdavCli = new WebdavCli(config);
        await webdavCli.start();
        return webdavCli;
    };
    return await run();
}
