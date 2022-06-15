#!/usr/bin/env node
import e from "fs";

import { dirname as t, join as s } from "path";

import { fileURLToPath as n } from "url";

import { v2 as o } from "webdav-server";

import i from "http-auth";

import r from "http-auth/src/auth/utils.js";

import a from "koa";

import c from "koa-logger";

import { loadcoremiddles as h } from "@masx200/serve-cli";

import l from "process";

const u = [ "all", "canCreate", "canDelete", "canMove", "canRename", "canAppend", "canWrite", "canRead", "canSource", "canGetMimeType", "canGetSize", "canListLocks", "canSetLock", "canRemoveLock", "canGetAvailableLocks", "canGetLock", "canAddChild", "canRemoveChild", "canGetChildren", "canSetProperty", "canGetProperty", "canGetProperties", "canRemoveProperty", "canGetCreationDate", "canGetLastModifiedDate", "canGetWebName", "canGetType" ];

function d(e) {
    const t = "Default realm", s = "HTTPBasicAuthentication" === e.authentication ? function(e, t, s) {
        return i.basic({
            realm: e
        }, ((e, n, o) => {
            o(e === t && n === s);
        }));
    }(t, e.user, e.pass) : function(e, t, s) {
        return i.digest({
            realm: e
        }, ((n, o) => {
            n === t ? o(r.md5(`${n}:${e}:${s}`)) : o();
        }));
    }(t, e.user, e.pass);
    return (e, t) => {
        s.check(((e, s) => {
            t();
        }))(e.request, e.response);
    };
}

function p(e) {
    return [ ...Array(Math.ceil(e / 8)) ].map((() => Math.random().toString(36).slice(-8))).join("").slice(-e);
}

const m = t(n(import.meta.url));

class A {
    config;
    server;
    #e;
    constructor(e) {
        this.config = this.#t(e);
        const t = this.#s(this.config), s = function(e, t, s) {
            return d({
                user: e,
                pass: t,
                authentication: s
            });
        }(this.config.username, this.config.password, t);
        this.#e = s, this.server = this.#n();
    }
    #t(t) {
        const n = s(m, "/../certs/self-signed.key.pem"), o = s(m, "/../certs/self-signed.cert.pem"), i = t.path || process.cwd(), r = t.host || "0.0.0.0", a = t.port || 1900, c = Boolean(t.digest);
        let h = (t.username || p(16)).toString(), l = (t.password || p(16)).toString();
        const d = Boolean(t.ssl), A = d ? e.readFileSync(t.sslKey || n).toString() : "", g = d ? e.readFileSync(t.sslCert || o).toString() : "", f = Boolean(t.disableAuthentication);
        f && (t.rights = t.rights || [ "canRead" ], h = "", l = "");
        const _ = (t.rights || [ "all" ]).filter((e => u.includes(e))), S = `${d ? "https" : "http"}://${r}:${a}`;
        return {
            ...t,
            host: r,
            path: i,
            port: a,
            username: h,
            digest: c,
            password: l,
            ssl: d,
            sslCert: g,
            sslKey: A,
            rights: _,
            url: S,
            disableAuthentication: f
        };
    }
    #n() {
        const e = this.config, t = new o.SimpleUserManager, s = t.addUser(e.username, e.password, !1), n = new o.SimplePathPrivilegeManager;
        n.setRights(s, "/", e.rights);
        const i = {
            requireAuthentification: !1,
            httpAuthentication: {
                askForAuthentication: () => ({}),
                getUser: (s, o) => {
                    t.getDefaultUser((t => {
                        n.setRights(t, "/", e.rights), o(null, t);
                    }));
                }
            },
            port: e.port,
            hostname: e.host
        };
        e.ssl && Reflect.set(i, "https", {
            cert: e.sslCert,
            key: e.sslKey
        });
        const r = new o.WebDAVServer(i);
        if (r.beforeRequest((async (e, t) => {
            const {url: s, headers: n, method: o} = e.request;
            console.log(">> ", o, s, n), t();
        })), e.disableAuthentication) r.beforeRequest(((e, t) => {
            e.request.method && [ "GET", "HEAD", "PROPFIND", "OPTIONS" ].includes(e.request.method) ? t() : (e.setCode(405), 
            e.exit());
        })); else {
            const e = this.#e;
            Array.isArray(this.config.methodsWithoutAuthentication) && this.config.methodsWithoutAuthentication.length ? r.beforeRequest(((t, s) => {
                t.request.method && this.config.methodsWithoutAuthentication?.includes(t.request.method) ? s() : e(t, s);
            })) : r.beforeRequest(e);
        }
        return r.beforeRequest(((e, t) => {
            const {headers: s, method: n} = e.request, {depth: o} = s;
            "PROPFIND" === n && "0" !== o && "1" !== o ? (e.setCode(403), e.exit()) : t();
        })), r.beforeRequest(function(e) {
            const t = new a;
            t.use(c()), h(t, e, !1);
            const s = t.callback();
            return function(e, t) {
                const {request: n, response: o} = e, [i, r] = [ n, o ];
                if (e.request.method && ![ "GET", "HEAD" ].includes(e.request.method)) return t();
                s(i, r);
            };
        }(e.path)), r.afterRequest(((e, t) => {
            const s = `>> ${e.request.method} ${e.requested.uri} > ${e.response.statusCode} `;
            console.log(s), t();
        })), r;
    }
    #s(e) {
        return e.digest ? "HTTPDigestAuthentication" : "HTTPBasicAuthentication";
    }
    async start() {
        const e = this.config, {server: t} = this;
        console.log(Object.fromEntries(Object.entries(e).filter((([e]) => ![ "sslKey", "sslCert" ].includes(e))))), 
        await t.setFileSystemAsync("/", new o.PhysicalFileSystem(e.path));
        const s = [ `Server running at ${e.url}`, "Hit CTRL-C to stop the server", "Run with --help to print help" ];
        let n;
        console.log(s.join("\n")), Object.defineProperty(t, "server", {
            get: () => n,
            set(t) {
                n = t, n && (n.on("error", (t => {
                    if ("EADDRINUSE" === Reflect.get(t, "code")) return console.error(t), void n?.listen(Math.round(65535 * Math.random()), e.host);
                    throw t;
                })), n.on("listening", (() => {
                    console.log("Server listening on " + JSON.stringify(n?.address()));
                })));
            },
            enumerable: !0,
            configurable: !0
        }), await t.startAsync(e.port);
    }
}

async function g(e) {
    console.log("webdav-cli", "\n"), (e.help || e.h) && (console.log([ "usage: webdav-cli [options]", "", "options:", "  --path,-pa        Path to folder [process.cwd()]", "  --host,-ho         Host to use [0.0.0.0]", "  --port,-po       Port to use [1900]", "  --digest,-dg     Enable digest authentication [basic]", "  --username,-u   Username for basic/digest authentication [random]", "  --password,-ps   Password for basic/digest authentication [random]", "  --disableAuthentication,-da  The server file becomes read-only without Authentication.[false]", "  --ssl,-s        Enable https [false]", "  --methodsWithoutAuthentication          methods Without Authentication[undefined]", "  --sslKey     Path to ssl key file [self-signed]", "  --sslCert    Path to ssl cert file [self-signed]", "  --help,-h       Print this list and exit", "  --rights,-r     Comma separated values without spaces [all]", "\n    'all', 'canCreate', 'canDelete', 'canMove', 'canRename', \n    'canAppend', 'canWrite', 'canRead', 'canSource', \n    'canGetMimeType', 'canGetSize', 'canListLocks', \n    'canSetLock', 'canRemoveLock', 'canGetAvailableLocks', \n    'canGetLock', 'canAddChild', 'canRemoveChild', \n    'canGetChildren', 'canSetProperty', 'canGetProperty', \n    'canGetProperties', 'canRemoveProperty', 'canGetCreationDate', \n    'canGetLastModifiedDate', 'canGetWebName', 'canGetType'", "", "env:", "  WEBDAV_CLI_PATH, WEBDAV_CLI_HOST, WEBDAV_CLI_PORT,", "  WEBDAV_CLI_USERNAME, WEBDAV_CLI_PASSWORD, WEBDAV_CLI_DIGEST,", "  WEBDAV_CLI_SSL, WEBDAV_CLI_SSL_KEY, WEBDAV_CLI_SSL_CERT,", "  WEBDAV_CLI_AUTO_INDEX, WEBDAV_CLI_RIGHTS", "  WEBDAV_CLI_DISABLE_AUTHENTICATION", "" ].join("\n")), 
    l.exit());
    const t = e.rights || e.r, s = t && "string" == typeof t ? t.split(",") : void 0, n = l.env.WEBDAV_CLI_RIGHTS ? l.env.WEBDAV_CLI_RIGHTS.split(",") : void 0, o = {
        path: e.path || l.env.WEBDAV_CLI_PATH || e.pa,
        host: e.host || l.env.WEBDAV_CLI_HOST || e.ho,
        port: Number(e.port || e.po) || parseInt(String(l.env.WEBDAV_CLI_PORT)),
        digest: e.digest || e.dg || Boolean(l.env.WEBDAV_CLI_DIGEST),
        username: e.username || l.env.WEBDAV_CLI_USERNAME || e.u,
        password: e.password || l.env.WEBDAV_CLI_PASSWORD || e.ps,
        ssl: e.ssl || e.s || Boolean(l.env.WEBDAV_CLI_SSL),
        sslKey: e.sslKey || l.env.WEBDAV_CLI_SSL_KEY,
        sslCert: e.sslCert || l.env.WEBDAV_CLI_SSL_CERT,
        disableAuthentication: e.disableAuthentication || l.env.WEBDAV_CLI_DISABLE_AUTHENTICATION || e.da,
        rights: s || n,
        methodsWithoutAuthentication: "string" == typeof e.methodsWithoutAuthentication ? String(e.methodsWithoutAuthentication).split(",") : Array.isArray(e.methodsWithoutAuthentication) ? e.methodsWithoutAuthentication : void 0
    };
    l.on("unhandledRejection", (e => {
        throw console.error(e), e;
    }));
    return await (async () => {
        const e = new A(o);
        return await e.start(), e;
    })();
}

export { u as RIGHTS, A as WebdavCli, p as getRandomString, g as main };
//# sourceMappingURL=index.js.map
