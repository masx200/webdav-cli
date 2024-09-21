#!/usr/bin/env node
import { dirname as e, join as t } from "path";

import s from "http-auth";

import n from "http-auth/src/auth/utils.js";

import { fileURLToPath as o } from "url";

import i from "fs";

import r from "koa";

import a from "koa-logger";

import { loadcoremiddles as c } from "@masx200/serve-cli";

import { v2 as h } from "webdav-server";

import l from "process";

const u = [ "all", "canCreate", "canDelete", "canMove", "canRename", "canAppend", "canWrite", "canRead", "canSource", "canGetMimeType", "canGetSize", "canListLocks", "canSetLock", "canRemoveLock", "canGetAvailableLocks", "canGetLock", "canAddChild", "canRemoveChild", "canGetChildren", "canSetProperty", "canGetProperty", "canGetProperties", "canRemoveProperty", "canGetCreationDate", "canGetLastModifiedDate", "canGetWebName", "canGetType" ];

function d(e) {
    const t = "Default realm", o = "HTTPBasicAuthentication" === e.authentication ? function(e, t, n) {
        return s.basic({
            realm: e
        }, ((e, s, o) => {
            o(e === t && s === n);
        }));
    }(t, e.user, e.pass) : function(e, t, o) {
        return s.digest({
            realm: e
        }, ((s, i) => {
            s === t ? i(n.md5(`${s}:${e}:${o}`)) : i();
        }));
    }(t, e.user, e.pass);
    return (e, t) => {
        o.check(((e, s) => {
            t();
        }))(e.request, e.response);
    };
}

function p(e) {
    return [ ...Array(Math.ceil(e / 8)) ].map((() => Math.random().toString(36).slice(-8))).join("").slice(-e);
}

const m = e(o(import.meta.url));

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
    #t(e) {
        const s = t(m, "/../certs/self-signed.key.pem"), n = t(m, "/../certs/self-signed.cert.pem"), o = e.path || process.cwd(), r = e.host || "0.0.0.0", a = e.port || 1900, c = Boolean(e.digest);
        let h = (e.username || p(16)).toString(), l = (e.password || p(16)).toString();
        const d = Boolean(e.ssl), A = d ? i.readFileSync(e.sslKey || s).toString() : "", g = d ? i.readFileSync(e.sslCert || n).toString() : "", f = Boolean(e.disableAuthentication);
        f && (e.rights = e.rights || [ "canRead" ], h = "", l = "");
        const _ = (e.rights || [ "all" ]).filter((e => u.includes(e))), S = `${d ? "https" : "http"}://${r}:${a}`;
        return {
            ...e,
            host: r,
            path: o,
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
        const e = this.config, t = new h.SimpleUserManager, s = t.addUser(e.username, e.password, !1), n = new h.SimplePathPrivilegeManager;
        n.setRights(s, "/", e.rights);
        const o = {
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
        e.ssl && Reflect.set(o, "https", {
            cert: e.sslCert,
            key: e.sslKey
        });
        const i = new h.WebDAVServer(o);
        if (i.beforeRequest((async (e, t) => {
            const {url: s, headers: n, method: o} = e.request;
            console.log(">> ", o, s, n), t();
        })), e.disableAuthentication) i.beforeRequest(((e, t) => {
            e.request.method && [ "GET", "HEAD", "PROPFIND", "OPTIONS" ].includes(e.request.method) ? t() : (e.setCode(405), 
            e.exit());
        })); else {
            const e = this.#e;
            Array.isArray(this.config.methodsWithoutAuthentication) && this.config.methodsWithoutAuthentication.length ? i.beforeRequest(((t, s) => {
                t.request.method && this.config.methodsWithoutAuthentication?.includes(t.request.method) ? s() : e(t, s);
            })) : i.beforeRequest(e);
        }
        return i.beforeRequest(((e, t) => {
            const {headers: s, method: n} = e.request, {depth: o} = s;
            "PROPFIND" === n && "0" !== o && "1" !== o ? (e.setCode(403), e.exit()) : t();
        })), i.beforeRequest(function(e) {
            const t = new r;
            t.use(a()), c(t, e, !1);
            const s = t.callback();
            return function(e, t) {
                const {request: n, response: o} = e, [i, r] = [ n, o ];
                if (e.request.method && ![ "GET", "HEAD" ].includes(e.request.method)) return t();
                s(i, r);
            };
        }(e.path)), i.afterRequest(((e, t) => {
            const s = `>> ${e.request.method} ${e.requested.uri} > ${e.response.statusCode} `;
            console.log(s), t();
        })), i;
    }
    #s(e) {
        return e.digest ? "HTTPDigestAuthentication" : "HTTPBasicAuthentication";
    }
    async start() {
        const e = this.config, {server: t} = this;
        console.log(Object.fromEntries(Object.entries(e).filter((([e]) => ![ "sslKey", "sslCert" ].includes(e))))), 
        await t.setFileSystemAsync("/", new h.PhysicalFileSystem(e.path));
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
