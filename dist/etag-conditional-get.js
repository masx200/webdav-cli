"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.etag_conditional_get = void 0;
const cors_1 = __importDefault(require("@koa/cors"));
const koa_stream_etag_1 = __importDefault(require("@masx200/koa-stream-etag"));
const koa_1 = __importDefault(require("koa"));
const koa_compress_1 = __importDefault(require("koa-compress"));
const koa_conditional_get_1 = __importDefault(require("koa-conditional-get"));
const koa_etag_1 = __importDefault(require("koa-etag"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_range_1 = __importDefault(require("koa-range"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa2_serve_index_1 = __importDefault(require("koa2-serve-index"));
function etag_conditional_get(publicpath) {
    const app = new koa_1.default();
    app.use(async (ctx, next) => {
        ctx.response.set("Access-Control-Allow-Origin", "*");
        return next();
    });
    app.use(async (ctx, next) => {
        await next();
        if (ctx.method === "HEAD") {
            ctx.res.end();
        }
        return;
    });
    app.use(koa_range_1.default);
    app.use(cors_1.default({}));
    app.use(koa_logger_1.default());
    app.use(koa_conditional_get_1.default());
    app.use(koa_compress_1.default({}));
    app.use(koa_stream_etag_1.default({}));
    app.use(koa_etag_1.default({}));
    app.use(koa2_serve_index_1.default(publicpath, { hidden: true }));
    app.use(koa_static_1.default(publicpath, { hidden: true }));
    const serverHandler = app.callback();
    return function middleware(ctx, next) {
        const { request, response } = ctx;
        const [req, res] = [request, response];
        if (
            ctx.request.method &&
            !["GET", "HEAD"].includes(ctx.request.method)
        ) {
            return next();
        }
        serverHandler(req, res);
        return;
    };
}
exports.etag_conditional_get = etag_conditional_get;
