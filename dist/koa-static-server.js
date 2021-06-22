import cors from "@koa/cors";
import streametag from "@masx200/koa-stream-etag";
import Koa from "koa";
import compress from "koa-compress";
import conditional from "koa-conditional-get";
import koaetag from "koa-etag";
import logger from "koa-logger";
import range from "koa-range";
import servestatic from "koa-static";
import serveIndex from "koa2-serve-index";
export function koa_static_server(publicpath) {
    const app = new Koa();
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
    app.use(range);
    app.use(cors({}));
    app.use(logger());
    app.use(conditional());
    app.use(compress({}));
    app.use(streametag({}));
    app.use(koaetag({}));
    app.use(serveIndex(publicpath, { hidden: true }));
    app.use(servestatic(publicpath, { hidden: true }));
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
