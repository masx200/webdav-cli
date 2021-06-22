import Koa from "koa";
import logger from "koa-logger";
import { loadcoremiddles } from "@masx200/serve-cli";
export function koa_static_server(publicpath) {
    const app = new Koa();
    app.use(logger());
    loadcoremiddles(app, publicpath);
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
