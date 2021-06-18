import fs from "fs";
import http from "http";
import https from "https";
import { join } from "path";
import { v2 as webdav } from "webdav-server";
import { etag_conditional_get } from "./koa-etag-conditional-get";
import { RIGHTS } from "./webdav-cli.constants";
import { WebdavCliConfig, WebdavCliRights } from "./webdav-cli.interfaces";
import { getRandomString } from "./webdav-cli.utils";

export class WebdavCli {
    config: WebdavCliConfig;
    server: webdav.WebDAVServer;
    constructor(config: Partial<WebdavCliConfig>) {
        this.config = this.getConfig(config);
        this.server = this.init();
    }

    getConfig(config: Partial<WebdavCliConfig>): WebdavCliConfig {
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

        const rights = (config.rights || ["all"]).filter(
            (item: WebdavCliRights[number]) => RIGHTS.includes(item),
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

    init(): webdav.WebDAVServer {
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
            httpAuthentication:
                // config.disableAuthentication
                // ?
                {
                    askForAuthentication: () => ({}),
                    getUser: (
                        ctx: any,
                        gotUserCallback: (
                            arg0: Error,
                            arg1: webdav.IUser,
                        ) => void,
                    ) => {
                        userManager.getDefaultUser((defaultUser) => {
                            privilegeManager.setRights(
                                defaultUser,
                                "/",
                                config.rights,
                            );
                            //@ts-ignore
                            gotUserCallback(null, defaultUser);
                        });
                    },
                },
            //     :
            //     new webdav[authentication](userManager, "Default realm"),
            // privilegeManager: privilegeManager,
            // https: config.ssl
            //     ? { cert: config.sslCert, key: config.sslKey }
            //     : undefined,
            port: config.port,
            hostname: config.host,
        };
        config.ssl &&
            Reflect.set(options, "https", {
                cert: config.sslCert,
                key: config.sslKey,
            });
        const server = new webdav.WebDAVServer(options);

        server.beforeRequest(async (ctx, next) => {
            const { url, headers, method } = ctx.request;
            console.log(">> ", method, url, headers);
            next();
        });

        server.beforeRequest((arg, next) => {
            const { headers, method } = arg.request;
            const { depth } = headers;
            if (method === "PROPFIND" && depth !== "0" && depth !== "1") {
                arg.setCode(403);
                arg.exit();
            } else {
                next();
            }
        });
        server.beforeRequest(etag_conditional_get(config.path));
        server.afterRequest((arg, next) => {
            const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} `;
            // server.emit('log', null, null, '/', log);
            console.log(log);
            next();
        });

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
        let rawhttpserver: http.Server | https.Server | undefined = undefined;

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
