import { WebdavCliConfig, WebdavCliRights } from "./webdav-cli.interfaces.ts";
import { dirname, join } from "path";

import { RIGHTS } from "./webdav-cli.constants.ts";
import { afterlogger } from "./afterlogger.ts";
import { beforelogger } from "./beforelogger.ts";
import { createhttpauthmiddle } from "./createhttpauthmiddle.ts";
import { fileURLToPath } from "url";
import fs from "fs";
import { getRandomString } from "./webdav-cli.utils.ts";
import http from "http";
import https from "https";
import { koa_static_server } from "./koa-static-server.ts";
import { propfindchecker } from "./propfindchecker.ts";
import { v2 as webdav } from "webdav-server";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class WebdavCli {
    config: WebdavCliConfig;
    server: webdav.WebDAVServer;
    #auth_middle: (ctx: webdav.HTTPRequestContext, next: () => void) => void;
    constructor(config: Partial<WebdavCliConfig>) {
        this.config = this.#getConfig(config);
        const authentication = this.#get_authentication(this.config);
        const auth_middle = createhttpauthmiddle(
            this.config.username,
            this.config.password,
            authentication,
        );
        this.#auth_middle = auth_middle;
        this.server = this.#init();
    }

    #getConfig(config: Partial<WebdavCliConfig>): WebdavCliConfig {
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
            ...config,
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

    #init(): webdav.WebDAVServer {
        const config = this.config;

        const userManager = new webdav.SimpleUserManager();
        const user = userManager.addUser(
            config.username,
            config.password,
            false,
        );

        const privilegeManager = new webdav.SimplePathPrivilegeManager();
        privilegeManager.setRights(user, "/", config.rights);

        const options = {
            requireAuthentification: false,
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

        server.beforeRequest(beforelogger());
        if (!config.disableAuthentication) {
            const auth_middle = this.#auth_middle;
            if (
                Array.isArray(this.config.methodsWithoutAuthentication) &&
                this.config.methodsWithoutAuthentication.length
            ) {
                server.beforeRequest((ctx, next): void => {
                    if (
                        ctx.request.method &&
                        this.config.methodsWithoutAuthentication?.includes(
                            ctx.request.method,
                        )
                    ) {
                        next();
                    } else {
                        auth_middle(ctx, next);
                    }
                });
            } else {
                server.beforeRequest(auth_middle);
            }
        } else {
            server.beforeRequest((ctx, next) => {
                const readonly_methods = ["GET", "HEAD", "PROPFIND", "OPTIONS"];
                if (
                    ctx.request.method &&
                    readonly_methods.includes(ctx.request.method)
                ) {
                    next();
                } else {
                    ctx.setCode(405);
                    ctx.exit();
                }
            });
        }
        server.beforeRequest(propfindchecker());
        server.beforeRequest(koa_static_server(config.path));
        server.afterRequest(afterlogger());

        return server;
    }
    #get_authentication(config: WebdavCliConfig) {
        return config.digest
            ? "HTTPDigestAuthentication"
            : "HTTPBasicAuthentication";
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
                    if (Reflect.get(err, "code") === "EADDRINUSE") {
                        console.error(err);
                        rawhttpserver?.listen(
                            Math.round(Math.random() * 65535),
                            config.host,
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
export type HTTPRequestContext = webdav.HTTPRequestContext;
