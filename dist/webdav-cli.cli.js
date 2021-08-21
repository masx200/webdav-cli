#!/usr/bin/env node
import e from "process";

import t from "minimist";

import s from "fs";

import { dirname as n, join as o } from "path";

import { fileURLToPath as r } from "url";

import { v2 as a } from "webdav-server";

import i from "http-auth";

import c from "http-auth/src/auth/utils.js";

import l from "koa";

import h from "koa-logger";

import { loadcoremiddles as p } from "@masx200/serve-cli";

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
            n === t ? o(c.md5(`${n}:${e}:${s}`)) : o();
        }));
    }(t, e.user, e.pass);
    return (e, t) => {
        s.check(((e, s) => {
            t();
        }))(e.request, e.response);
    };
}

const u = [ "all", "canCreate", "canDelete", "canMove", "canRename", "canAppend", "canWrite", "canRead", "canSource", "canGetMimeType", "canGetSize", "canListLocks", "canSetLock", "canRemoveLock", "canGetAvailableLocks", "canGetLock", "canAddChild", "canRemoveChild", "canGetChildren", "canSetProperty", "canGetProperty", "canGetProperties", "canRemoveProperty", "canGetCreationDate", "canGetLastModifiedDate", "canGetWebName", "canGetType" ];

function m(e) {
    return [ ...Array(Math.ceil(e / 8)) ].map((() => Math.random().toString(36).slice(-8))).join("").slice(-e);
}

const g = n(r(import.meta.url));

class A {
    config;
    server;
    constructor(e) {
        this.config = this.getConfig(e), this.server = this.init();
    }
    getConfig(e) {
        const t = o(g, "/../certs/self-signed.key.pem"), n = o(g, "/../certs/self-signed.cert.pem"), r = e.path || process.cwd(), a = e.host || "0.0.0.0", i = e.port || 1900, c = Boolean(e.digest);
        let l = (e.username || m(16)).toString(), h = (e.password || m(16)).toString();
        const p = Boolean(e.ssl), d = p ? s.readFileSync(e.sslKey || t).toString() : "", A = p ? s.readFileSync(e.sslCert || n).toString() : "", f = Boolean(e.disableAuthentication);
        f && (e.rights = e.rights || [ "canRead" ], l = "", h = "");
        return {
            host: a,
            path: r,
            port: i,
            username: l,
            digest: c,
            password: h,
            ssl: p,
            sslCert: A,
            sslKey: d,
            rights: (e.rights || [ "all" ]).filter((e => u.includes(e))),
            url: `${p ? "https" : "http"}://${a}:${i}`,
            disableAuthentication: f
        };
    }
    init() {
        const e = this.config, t = new a.SimpleUserManager, s = t.addUser(e.username, e.password, !1), n = new a.SimplePathPrivilegeManager;
        n.setRights(s, "/", e.rights);
        const o = e.digest ? "HTTPDigestAuthentication" : "HTTPBasicAuthentication", r = {
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
        e.ssl && Reflect.set(r, "https", {
            cert: e.sslCert,
            key: e.sslKey
        });
        const i = new a.WebDAVServer(r);
        return i.beforeRequest((async (e, t) => {
            const {url: s, headers: n, method: o} = e.request;
            console.log(">> ", o, s, n), t();
        })), e.disableAuthentication || i.beforeRequest(function(e, t, s) {
            return d({
                user: e,
                pass: t,
                authentication: s
            });
        }(e.username, e.password, o)), i.beforeRequest(((e, t) => {
            const {headers: s, method: n} = e.request, {depth: o} = s;
            "PROPFIND" === n && "0" !== o && "1" !== o ? (e.setCode(403), e.exit()) : t();
        })), i.beforeRequest(function(e) {
            const t = new l;
            t.use(h()), p(t, e, !1);
            const s = t.callback();
            return function(e, t) {
                const {request: n, response: o} = e, [r, a] = [ n, o ];
                if (e.request.method && ![ "GET", "HEAD" ].includes(e.request.method)) return t();
                s(r, a);
            };
        }(e.path)), i.afterRequest(((e, t) => {
            const s = `>> ${e.request.method} ${e.requested.uri} > ${e.response.statusCode} `;
            console.log(s), t();
        })), i;
    }
    async start() {
        const e = this.config, {server: t} = this;
        console.log(Object.fromEntries(Object.entries(e).filter((([e]) => ![ "sslKey", "sslCert" ].includes(e))))), 
        await t.setFileSystemAsync("/", new a.PhysicalFileSystem(e.path));
        const s = [ `Server running at ${e.url}`, "Hit CTRL-C to stop the server", "Run with --help to print help" ];
        let n;
        console.log(s.join("\n")), Object.defineProperty(t, "server", {
            get: () => n,
            set(e) {
                n = e, n && (n.on("error", (e => {
                    if ("EADDRINUSE" === Reflect.get(e, "code")) return console.error(e), void n?.listen(Math.round(65535 * Math.random()));
                    throw e;
                })), n.on("listening", (() => {
                    console.log("Server listening on " + JSON.stringify(n?.address()));
                })));
            },
            enumerable: !0,
            configurable: !0
        }), await t.startAsync(e.port);
    }
}

const f = t(e.argv.slice(2));

console.log("webdav-cli", "\n"), (f.help || f.h) && (console.log([ "usage: webdav-cli [options]", "", "options:", "  --path,-pa        Path to folder [process.cwd()]", "  --host,-ho         Host to use [0.0.0.0]", "  --port,-po       Port to use [1900]", "  --digest,-dg     Enable digest authentication [basic]", "  --username,-u   Username for basic/digest authentication [random]", "  --password,-ps   Password for basic/digest authentication [random]", "  --disableAuthentication,-da  The server file becomes read-only without Authentication.[false]", "  --ssl,-s        Enable https [false]", "  --sslKey     Path to ssl key file [self-signed]", "  --sslCert    Path to ssl cert file [self-signed]", "  --help,-h       Print this list and exit", "  --rights,-r     Comma separated values without spaces [all]", "\n    'all', 'canCreate', 'canDelete', 'canMove', 'canRename', \n    'canAppend', 'canWrite', 'canRead', 'canSource', \n    'canGetMimeType', 'canGetSize', 'canListLocks', \n    'canSetLock', 'canRemoveLock', 'canGetAvailableLocks', \n    'canGetLock', 'canAddChild', 'canRemoveChild', \n    'canGetChildren', 'canSetProperty', 'canGetProperty', \n    'canGetProperties', 'canRemoveProperty', 'canGetCreationDate', \n    'canGetLastModifiedDate', 'canGetWebName', 'canGetType'", "", "env:", "  WEBDAV_CLI_PATH, WEBDAV_CLI_HOST, WEBDAV_CLI_PORT,", "  WEBDAV_CLI_USERNAME, WEBDAV_CLI_PASSWORD, WEBDAV_CLI_DIGEST,", "  WEBDAV_CLI_SSL, WEBDAV_CLI_SSL_KEY, WEBDAV_CLI_SSL_CERT,", "  WEBDAV_CLI_AUTO_INDEX, WEBDAV_CLI_RIGHTS", "  WEBDAV_CLI_DISABLE_AUTHENTICATION", "" ].join("\n")), 
e.exit());

const _ = f.rights || f.r, C = _ && "string" == typeof _ ? _.split(",") : void 0, S = e.env.WEBDAV_CLI_RIGHTS ? e.env.WEBDAV_CLI_RIGHTS.split(",") : void 0, L = {
    path: f.path || e.env.WEBDAV_CLI_PATH || f.pa,
    host: f.host || e.env.WEBDAV_CLI_HOST || f.ho,
    port: Number(f.port || f.po) || parseInt(String(e.env.WEBDAV_CLI_PORT)),
    digest: f.digest || f.dg || Boolean(e.env.WEBDAV_CLI_DIGEST),
    username: f.username || e.env.WEBDAV_CLI_USERNAME || f.u,
    password: f.password || e.env.WEBDAV_CLI_PASSWORD || f.ps,
    ssl: f.ssl || f.s || Boolean(e.env.WEBDAV_CLI_SSL),
    sslKey: f.sslKey || e.env.WEBDAV_CLI_SSL_KEY,
    sslCert: f.sslCert || e.env.WEBDAV_CLI_SSL_CERT,
    disableAuthentication: f.disableAuthentication || e.env.WEBDAV_CLI_DISABLE_AUTHENTICATION || f.da,
    rights: C || S
};

(async () => {
    const e = new A(L);
    await e.start();
})(), e.on("unhandledRejection", (e => {
    console.error(e);
}));
//# sourceMappingURL=webdav-cli.cli.js.map
