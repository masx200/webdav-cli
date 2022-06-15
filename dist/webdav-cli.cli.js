#!/usr/bin/env node
import e from "process";

import t from "minimist";

import s from "fs";

import { dirname as n, join as o } from "path";

import { fileURLToPath as i } from "url";

import { v2 as r } from "webdav-server";

import a from "http-auth";

import c from "http-auth/src/auth/utils.js";

import h from "koa";

import l from "koa-logger";

import { loadcoremiddles as u } from "@masx200/serve-cli";

function d(e) {
    const t = "Default realm", s = "HTTPBasicAuthentication" === e.authentication ? function(e, t, s) {
        return a.basic({
            realm: e
        }, ((e, n, o) => {
            o(e === t && n === s);
        }));
    }(t, e.user, e.pass) : function(e, t, s) {
        return a.digest({
            realm: e
        }, ((n, o) => {
            n === t ? o(c.md5(`${n}:${e}:${s}`)) : o();
        }));
    }(t, e.user, e.pass);
    return (e, t) => {
        s.check(((e, s) => {
            t();
        }))(e.request, e.response);
    };
}

const p = [ "all", "canCreate", "canDelete", "canMove", "canRename", "canAppend", "canWrite", "canRead", "canSource", "canGetMimeType", "canGetSize", "canListLocks", "canSetLock", "canRemoveLock", "canGetAvailableLocks", "canGetLock", "canAddChild", "canRemoveChild", "canGetChildren", "canSetProperty", "canGetProperty", "canGetProperties", "canRemoveProperty", "canGetCreationDate", "canGetLastModifiedDate", "canGetWebName", "canGetType" ];

function m(e) {
    return [ ...Array(Math.ceil(e / 8)) ].map((() => Math.random().toString(36).slice(-8))).join("").slice(-e);
}

const g = n(i(import.meta.url));

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
        const t = o(g, "/../certs/self-signed.key.pem"), n = o(g, "/../certs/self-signed.cert.pem"), i = e.path || process.cwd(), r = e.host || "0.0.0.0", a = e.port || 1900, c = Boolean(e.digest);
        let h = (e.username || m(16)).toString(), l = (e.password || m(16)).toString();
        const u = Boolean(e.ssl), d = u ? s.readFileSync(e.sslKey || t).toString() : "", A = u ? s.readFileSync(e.sslCert || n).toString() : "", f = Boolean(e.disableAuthentication);
        f && (e.rights = e.rights || [ "canRead" ], h = "", l = "");
        const _ = (e.rights || [ "all" ]).filter((e => p.includes(e))), S = `${u ? "https" : "http"}://${r}:${a}`;
        return {
            ...e,
            host: r,
            path: i,
            port: a,
            username: h,
            digest: c,
            password: l,
            ssl: u,
            sslCert: A,
            sslKey: d,
            rights: _,
            url: S,
            disableAuthentication: f
        };
    }
    #n() {
        const e = this.config, t = new r.SimpleUserManager, s = t.addUser(e.username, e.password, !1), n = new r.SimplePathPrivilegeManager;
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
        const i = new r.WebDAVServer(o);
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
            const t = new h;
            t.use(l()), u(t, e, !1);
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
        await t.setFileSystemAsync("/", new r.PhysicalFileSystem(e.path));
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

(async function(t) {
    console.log("webdav-cli", "\n"), (t.help || t.h) && (console.log([ "usage: webdav-cli [options]", "", "options:", "  --path,-pa        Path to folder [process.cwd()]", "  --host,-ho         Host to use [0.0.0.0]", "  --port,-po       Port to use [1900]", "  --digest,-dg     Enable digest authentication [basic]", "  --username,-u   Username for basic/digest authentication [random]", "  --password,-ps   Password for basic/digest authentication [random]", "  --disableAuthentication,-da  The server file becomes read-only without Authentication.[false]", "  --ssl,-s        Enable https [false]", "  --methodsWithoutAuthentication          methods Without Authentication[undefined]", "  --sslKey     Path to ssl key file [self-signed]", "  --sslCert    Path to ssl cert file [self-signed]", "  --help,-h       Print this list and exit", "  --rights,-r     Comma separated values without spaces [all]", "\n    'all', 'canCreate', 'canDelete', 'canMove', 'canRename', \n    'canAppend', 'canWrite', 'canRead', 'canSource', \n    'canGetMimeType', 'canGetSize', 'canListLocks', \n    'canSetLock', 'canRemoveLock', 'canGetAvailableLocks', \n    'canGetLock', 'canAddChild', 'canRemoveChild', \n    'canGetChildren', 'canSetProperty', 'canGetProperty', \n    'canGetProperties', 'canRemoveProperty', 'canGetCreationDate', \n    'canGetLastModifiedDate', 'canGetWebName', 'canGetType'", "", "env:", "  WEBDAV_CLI_PATH, WEBDAV_CLI_HOST, WEBDAV_CLI_PORT,", "  WEBDAV_CLI_USERNAME, WEBDAV_CLI_PASSWORD, WEBDAV_CLI_DIGEST,", "  WEBDAV_CLI_SSL, WEBDAV_CLI_SSL_KEY, WEBDAV_CLI_SSL_CERT,", "  WEBDAV_CLI_AUTO_INDEX, WEBDAV_CLI_RIGHTS", "  WEBDAV_CLI_DISABLE_AUTHENTICATION", "" ].join("\n")), 
    e.exit());
    const s = t.rights || t.r, n = s && "string" == typeof s ? s.split(",") : void 0, o = e.env.WEBDAV_CLI_RIGHTS ? e.env.WEBDAV_CLI_RIGHTS.split(",") : void 0, i = {
        path: t.path || e.env.WEBDAV_CLI_PATH || t.pa,
        host: t.host || e.env.WEBDAV_CLI_HOST || t.ho,
        port: Number(t.port || t.po) || parseInt(String(e.env.WEBDAV_CLI_PORT)),
        digest: t.digest || t.dg || Boolean(e.env.WEBDAV_CLI_DIGEST),
        username: t.username || e.env.WEBDAV_CLI_USERNAME || t.u,
        password: t.password || e.env.WEBDAV_CLI_PASSWORD || t.ps,
        ssl: t.ssl || t.s || Boolean(e.env.WEBDAV_CLI_SSL),
        sslKey: t.sslKey || e.env.WEBDAV_CLI_SSL_KEY,
        sslCert: t.sslCert || e.env.WEBDAV_CLI_SSL_CERT,
        disableAuthentication: t.disableAuthentication || e.env.WEBDAV_CLI_DISABLE_AUTHENTICATION || t.da,
        rights: n || o,
        methodsWithoutAuthentication: "string" == typeof t.methodsWithoutAuthentication ? String(t.methodsWithoutAuthentication).split(",") : Array.isArray(t.methodsWithoutAuthentication) ? t.methodsWithoutAuthentication : void 0
    };
    return e.on("unhandledRejection", (e => {
        throw console.error(e), e;
    })), await (async () => {
        const e = new A(i);
        return await e.start(), e;
    })();
})(t(e.argv.slice(2))).catch(console.error);
//# sourceMappingURL=webdav-cli.cli.js.map
