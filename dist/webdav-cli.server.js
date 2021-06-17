"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebdavCli = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const webdav_server_1 = require("webdav-server");
const etag_conditional_get_1 = require("./etag-conditional-get");
const webdav_cli_constants_1 = require("./webdav-cli.constants");
const webdav_cli_utils_1 = require("./webdav-cli.utils");
class WebdavCli {
    config;
    server;
    constructor(config) {
        this.config = this.getConfig(config);
        this.server = this.init();
    }
    getConfig(config) {
        const selfSignedKey = path_1.join(
            __dirname,
            "/../certs/self-signed.key.pem",
        );
        const selfSignedCert = path_1.join(
            __dirname,
            "/../certs/self-signed.cert.pem",
        );
        const path = config.path || process.cwd();
        const host = config.host || "0.0.0.0";
        const port = config.port || 1900;
        const digest = Boolean(config.digest);
        let username = (
            config.username || webdav_cli_utils_1.getRandomString(16)
        ).toString();
        let password = (
            config.password || webdav_cli_utils_1.getRandomString(16)
        ).toString();
        const ssl = Boolean(config.ssl);
        const sslKey = ssl
            ? fs_1.default
                  .readFileSync(config.sslKey || selfSignedKey)
                  .toString()
            : "";
        const sslCert = ssl
            ? fs_1.default
                  .readFileSync(config.sslCert || selfSignedCert)
                  .toString()
            : "";
        const disableAuthentication = Boolean(config.disableAuthentication);
        if (disableAuthentication) {
            config.rights = config.rights || ["canRead"];
            username = "";
            password = "";
        }
        const rights = (config.rights || ["all"]).filter((item) =>
            webdav_cli_constants_1.RIGHTS.includes(item),
        );
        const url = `${ssl ? "https" : "http"}://${host}:${port}`;
        const directory = Boolean(config.directory);
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
            directory,
        };
    }
    init() {
        const config = this.config;
        const userManager = new webdav_server_1.v2.SimpleUserManager();
        const user = userManager.addUser(
            config.username,
            config.password,
            false,
        );
        const privilegeManager =
            new webdav_server_1.v2.SimplePathPrivilegeManager();
        privilegeManager.setRights(user, "/", config.rights);
        const authentication = config.digest
            ? "HTTPDigestAuthentication"
            : "HTTPBasicAuthentication";
        const options = {
            httpAuthentication: config.disableAuthentication
                ? {
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
                  }
                : new webdav_server_1.v2[authentication](
                      userManager,
                      "Default realm",
                  ),
            privilegeManager: privilegeManager,
            port: config.port,
            hostname: config.host,
        };
        config.ssl &&
            Reflect.set(options, "https", {
                cert: config.sslCert,
                key: config.sslKey,
            });
        const server = new webdav_server_1.v2.WebDAVServer(options);
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
        server.beforeRequest(
            etag_conditional_get_1.etag_conditional_get(config.path),
        );
        server.afterRequest((arg, next) => {
            const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} `;
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
            new webdav_server_1.v2.PhysicalFileSystem(config.path),
        );
        const logs = [
            `Server running at ${config.url}`,
            `rights: ${config.rights}`,
            `digest: ${config.digest}`,
            `username: ${config.username}`,
            `password: ${config.password}`,
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
exports.WebdavCli = WebdavCli;
