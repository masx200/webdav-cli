"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.etag_conditional_get = void 0;
const etag_1 = __importDefault(require("etag"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fresh_1 = __importDefault(require("fresh"));
function etag_conditional_get(publicpath) {
    return function middleware(ctx, next) {
        const { request, response } = ctx;
        const [req, res] = [request, response];
        if (
            ctx.request.method &&
            !["GET", "HEAD"].includes(ctx.request.method)
        ) {
            return next();
        }
        const filepath = path_1.default.join(publicpath, ctx.requested.uri);
        if (
            !ctx.response.hasHeader("etag") &&
            fs_1.default.existsSync(filepath) &&
            ctx.request.method &&
            ["GET", "HEAD"].includes(ctx.request.method)
        ) {
            const stat = fs_1.default.statSync(filepath);
            if (stat.isFile()) {
                ctx.response.setHeader(
                    "etag",
                    etag_1.default(fs_1.default.statSync(filepath)),
                );
            }
        }
        if (isFresh(req, res)) {
            ctx.response.statusCode = 304;
            ctx.response.end();
            ctx.exit();
            return;
        }
        next();
    };
}
exports.etag_conditional_get = etag_conditional_get;
function isFresh(req, res) {
    return fresh_1.default(req.headers, {
        etag: res.getHeader("ETag"),
        "last-modified": res.getHeader("Last-Modified"),
    });
}
