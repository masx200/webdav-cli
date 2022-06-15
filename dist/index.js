#!/usr/bin/env node
import e from "fs";

import { dirname as t, join as s } from "path";

import { fileURLToPath as n } from "url";

import { v2 as r } from "webdav-server";

import o from "http-auth";

import i from "http-auth/src/auth/utils.js";

import a from "koa";

import c from "koa-logger";

import { loadcoremiddles as h } from "@masx200/serve-cli";

const l = [ "all", "canCreate", "canDelete", "canMove", "canRename", "canAppend", "canWrite", "canRead", "canSource", "canGetMimeType", "canGetSize", "canListLocks", "canSetLock", "canRemoveLock", "canGetAvailableLocks", "canGetLock", "canAddChild", "canRemoveChild", "canGetChildren", "canSetProperty", "canGetProperty", "canGetProperties", "canRemoveProperty", "canGetCreationDate", "canGetLastModifiedDate", "canGetWebName", "canGetType" ];

function u(e) {
    const t = "Default realm", s = "HTTPBasicAuthentication" === e.authentication ? function(e, t, s) {
        return o.basic({
            realm: e
        }, ((e, n, r) => {
            r(e === t && n === s);
        }));
    }(t, e.user, e.pass) : function(e, t, s) {
        return o.digest({
            realm: e
        }, ((n, r) => {
            n === t ? r(i.md5(`${n}:${e}:${s}`)) : r();
        }));
    }(t, e.user, e.pass);
    return (e, t) => {
        s.check(((e, s) => {
            t();
        }))(e.request, e.response);
    };
}

function d(e) {
    return [ ...Array(Math.ceil(e / 8)) ].map((() => Math.random().toString(36).slice(-8))).join("").slice(-e);
}

const m = t(n(import.meta.url));

class p {
    config;
    server;
    auth_middle;
    constructor(e) {
        this.config = this.getConfig(e);
        const t = this.get_authentication(this.config), s = function(e, t, s) {
            return u({
                user: e,
                pass: t,
                authentication: s
            });
        }(this.config.username, this.config.password, t);
        this.auth_middle = s, this.server = this.init();
    }
    getConfig(t) {
        const n = s(m, "/../certs/self-signed.key.pem"), r = s(m, "/../certs/self-signed.cert.pem"), o = t.path || process.cwd(), i = t.host || "0.0.0.0", a = t.port || 1900, c = Boolean(t.digest);
        let h = (t.username || d(16)).toString(), u = (t.password || d(16)).toString();
        const p = Boolean(t.ssl), g = p ? e.readFileSync(t.sslKey || n).toString() : "", f = p ? e.readFileSync(t.sslCert || r).toString() : "", y = Boolean(t.disableAuthentication);
        y && (t.rights = t.rights || [ "canRead" ], h = "", u = "");
        const A = (t.rights || [ "all" ]).filter((e => l.includes(e))), R = `${p ? "https" : "http"}://${i}:${a}`;
        return {
            ...t,
            host: i,
            path: o,
            port: a,
            username: h,
            digest: c,
            password: u,
            ssl: p,
            sslCert: f,
            sslKey: g,
            rights: A,
            url: R,
            disableAuthentication: y
        };
    }
    init() {
        const e = this.config, t = new r.SimpleUserManager, s = t.addUser(e.username, e.password, !1), n = new r.SimplePathPrivilegeManager;
        n.setRights(s, "/", e.rights);
        const o = {
            httpAuthentication: {
                askForAuthentication: () => ({}),
                getUser: (s, r) => {
                    t.getDefaultUser((t => {
                        n.setRights(t, "/", e.rights), r(null, t);
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
            const {url: s, headers: n, method: r} = e.request;
            console.log(">> ", r, s, n), t();
        })), e.disableAuthentication) i.beforeRequest(((e, t) => {
            e.request.method && [ "GET", "HEAD", "PROPFIND", "OPTIONS" ].includes(e.request.method) ? t() : (e.setCode(405), 
            e.exit());
        })); else {
            const e = this.auth_middle;
            Array.isArray(this.config.methodsWithoutAuthentication) && this.config.methodsWithoutAuthentication.length ? i.beforeRequest(((t, s) => {
                t.request.method && this.config.methodsWithoutAuthentication?.includes(t.request.method) ? s() : e(t, s);
            })) : i.beforeRequest(e);
        }
        return i.beforeRequest(((e, t) => {
            const {headers: s, method: n} = e.request, {depth: r} = s;
            "PROPFIND" === n && "0" !== r && "1" !== r ? (e.setCode(403), e.exit()) : t();
        })), i.beforeRequest(function(e) {
            const t = new a;
            t.use(c()), h(t, e, !1);
            const s = t.callback();
            return function(e, t) {
                const {request: n, response: r} = e, [o, i] = [ n, r ];
                if (e.request.method && ![ "GET", "HEAD" ].includes(e.request.method)) return t();
                s(o, i);
            };
        }(e.path)), i.afterRequest(((e, t) => {
            const s = `>> ${e.request.method} ${e.requested.uri} > ${e.response.statusCode} `;
            console.log(s), t();
        })), i;
    }
    get_authentication(e) {
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

export { l as RIGHTS, p as WebdavCli, d as getRandomString };
//# sourceMappingURL=index.js.map
