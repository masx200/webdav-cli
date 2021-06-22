//@ts-ignore
import Koa from "koa";
import logger from "koa-logger";
import { v2 as webdav } from "webdav-server";
//@ts-ignore
import {} from '@masx200/serve-cli'
export function koa_static_server(publicpath: string) {
    const app = new Koa();
    // app.use(async (ctx, next) => {
    //     ctx.response.set("Access-Control-Allow-Origin", "*");
    //     return next();
    // });

    // app.use(async (ctx, next) => {
    //     await next();
    //     if (ctx.method === "HEAD") {
    //         ctx.res.end();
    //     }
    //     return;
    // });
    // app.use(range);
    // app.use(cors({}));
    app.use(logger());
    // app.use(conditional());

    // app.use(compress({}));
    // app.use(streametag({}));
    // app.use(koaetag({}));
    // app.use(serveIndex(publicpath, { hidden: true }));
    // app.use(servestatic(publicpath, { hidden: true }));

    const serverHandler = app.callback();
    return function middleware(
        ctx: webdav.HTTPRequestContext,
        next: () => void,
    ) {
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
