import http from "http";
import https from "https";
import fs from "fs";
import { join } from "path";
import { v2 as webdav } from "webdav-server";
import { getRandomString } from "./webdav-cli.utils";
import { RIGHTS } from "./webdav-cli.constants";
import {
    WebdavCliServer,
    WebdavCliConfig,
    WebdavCliRights,
} from "./webdav-cli.interfaces";

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

        const server = new webdav.WebDAVServer({
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
                              //@ts-ignore
                              gotUserCallback(null, defaultUser);
                          });
                      },
                  }
                : new webdav[authentication](userManager, "Default realm"),
            privilegeManager: privilegeManager,
            https: config.ssl
                ? { cert: config.sslCert, key: config.sslKey }
                : undefined,
            port: config.port,
            hostname: config.host,
        });

        //  server.config = config;

        server.beforeRequest(async (ctx, next) => {
            /*  if (config.directory) {
      if(isBrowser) {	        const isBrowser = ctx.request.headers['user-agent'].search('Mozilla/5.0') !== -1;
        try {	        if(isBrowser) {
          const resource = await server.getResourceAsync(ctx, ctx.requested.uri);	          try {
          const list = await resource.readDirAsync();	            const resource = await server.getResourceAsync(ctx, ctx.requested.uri);
          const uri = ctx.requested.uri.slice(-1) === '/' ? ctx.requested.uri : ctx.requested.uri + '/';	            const list = await resource.readDirAsync();
          const up =  `<a href="${ uri.split('/').slice(0, -2).join('/') || '/' }">..</a><br/>`;	            const uri = ctx.requested.uri.slice(-1) === '/' ? ctx.requested.uri : ctx.requested.uri + '/';
     
          ctx.response.setHeader('Content-Type', 'text/html');	              ctx.requested.path = `${uri}index.html` as any;
          ctx.response.end(html);	            } else {
        } catch {}	              const up =  `<a href="${ uri.split('/').slice(0, -2).join('/') || '/' }">..</a><br/>`;
              const html = up + list.map(item => `<a href="${ uri + item }">${ item }</a><br/>`).join('');
              // ctx.response.setHeader('Content-Type', 'text/html;charset=UTF-8');
              ctx.response.end(`<html><head><meta charset="UTF-8"></head><body>${html}</body></html>`);
            }
          } catch {}
        }
      }	      }*/
            const { url, headers, method } = ctx.request;
            console.log(">> ", { method, url }, headers);
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
        server.afterRequest((arg, next) => {
            const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} ${arg.response.statusMessage}`;
            // server.emit('log', null, null, '/', log);
            console.log(log);
            next();
        });

        return server;
    }
    async start() {
        const config = this.config;
        const { server } = this;
        console.log(config);
        await server.setFileSystemAsync(
            "/",
            new webdav.PhysicalFileSystem(config.path),
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
