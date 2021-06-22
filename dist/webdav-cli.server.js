import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { v2 as webdav } from "webdav-server";
import { afterlogger } from "./afterlogger.js";
import { beforelogger } from "./beforelogger.js";
import { createhttpauthmiddle } from "./createhttpauthmiddle.js";
import { koa_static_server } from "./koa-static-server.js";
import { propfindchecker } from "./propfindchecker.js";
import { RIGHTS } from "./webdav-cli.constants.js";
import { getRandomString } from "./webdav-cli.utils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class WebdavCli {
    config;
    server;
    constructor(config) {
        this.config = this.getConfig(config);
        this.server = this.init();
    }
    getConfig(config) {
        const selfSignedKey = join(__dirname, "/../certs/self-signed.key.pem");
        const selfSignedCert = join(
            __dirname,
            "/../certs/self-signed.cert.pem",
        );
        const path = config.path || process.cwd();
        const host = config.host || "0.0.0.0";
        const port = config.port || 1900;
        const digest = Boolean(config.digest);
        let username = (config.username || getRandomString(16)).toString();
        let password = (config.password || getRandomString(16)).toString();
        const ssl = Boolean(config.ssl);
        const sslKey = ssl
            ? fs.readFileSync(config.sslKey || selfSignedKey).toString()
            : "";
        const sslCert = ssl
            ? fs.readFileSync(config.sslCert || selfSignedCert).toString()
            : "";
        const disableAuthentication = Boolean(config.disableAuthentication);
        if (disableAuthentication) {
            config.rights = config.rights || ["canRead"];
            username = "";
            password = "";
        }
        const rights = (config.rights || ["all"]).filter((item) =>
            RIGHTS.includes(item),
        );
        const url = `${ssl ? "https" : "http"}://${host}:${port}`;
        return {
            host,
            path,
            port,
            username,
            digest,
            password,
            ssl,
            sslCert,
            sslKey,
            rights,
            url,
            disableAuthentication,
        };
    }
    init() {
        const config = this.config;
        const userManager = new webdav.SimpleUserManager();
        const user = userManager.addUser(
            config.username,
            config.password,
            false,
        );
        const privilegeManager = new webdav.SimplePathPrivilegeManager();
        privilegeManager.setRights(user, "/", config.rights);
        const authentication = config.digest
            ? "HTTPDigestAuthentication"
            : "HTTPBasicAuthentication";
        const options = {
            httpAuthentication: {
                askForAuthentication: () => ({}),
                getUser: (ctx, gotUserCallback) => {
                    userManager.getDefaultUser((defaultUser) => {
                        privilegeManager.setRights(
                            defaultUser,
                            "/",
                            config.rights,
                        );
                        gotUserCallback(null, defaultUser);
                    });
                },
            },
            port: config.port,
            hostname: config.host,
        };
        config.ssl &&
            Reflect.set(options, "https", {
                cert: config.sslCert,
                key: config.sslKey,
            });
        const server = new webdav.WebDAVServer(options);
        server.beforeRequest(beforelogger());
        if (!config.disableAuthentication) {
            server.beforeRequest(
                createhttpauthmiddle(
                    config.username,
                    config.password,
                    authentication,
                ),
            );
        }
        server.beforeRequest(propfindchecker());
        server.beforeRequest(koa_static_server(config.path));
        server.afterRequest(afterlogger());
        return server;
    }
    async start() {
        const config = this.config;
        const { server } = this;
        console.log(
            Object.fromEntries(
                Object.entries(config).filter(([key]) => {
                    return !["sslKey", "sslCert"].includes(key);
                }),
            ),
        );
        await server.setFileSystemAsync(
            "/",
            new webdav.PhysicalFileSystem(config.path),
        );
        const logs = [
            `Server running at ${config.url}`,
            "Hit CTRL-C to stop the server",
            "Run with --help to print help",
        ];
        console.log(logs.join("\n"));
        let rawhttpserver = undefined;
        Object.defineProperty(server, "server", {
            get() {
                return rawhttpserver;
            },
            set(v) {
                rawhttpserver = v;
                if (!rawhttpserver) {
                    return;
                }
                rawhttpserver.on("error", (err) => {
                    if (err.code === "EADDRINUSE") {
                        console.error(err);
                        rawhttpserver?.listen(
                            Math.round(Math.random() * 65535),
                        );
                        return;
                    } else {
                        throw err;
                    }
                });
                rawhttpserver.on("listening", () => {
                    console.log(
                        `Server listening on ` +
                            JSON.stringify(rawhttpserver?.address()),
                    );
                });
                return;
            },
            enumerable: true,
            configurable: true,
        });
        await server.startAsync(config.port);
    }
}
