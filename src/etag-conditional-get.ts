import etag from "etag";
import fs from "fs";
import path from "path";
import { v2 as webdav } from "webdav-server";
import fresh from "fresh";
import { IncomingMessage, ServerResponse } from "http";
export function etag_conditional_get(publicpath: string) {
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
        const filepath = path.join(publicpath, ctx.requested.uri);

        if (
            !ctx.response.hasHeader("etag") &&
            fs.existsSync(filepath) &&
            ctx.request.method &&
            ["GET", "HEAD"].includes(ctx.request.method)
        ) {
            const stat = fs.statSync(filepath);
            if (stat.isFile()) {
                ctx.response.setHeader("etag", etag(fs.statSync(filepath)));
            }
        }

        if (
            isFresh(req, res)
            // ctx.response.hasHeader("etag") &&
            // ctx.request.headers["if-none-match"] ===
            //     ctx.response.getHeader("etag")
        ) {
            ctx.response.statusCode = 304;
            ctx.response.end();
            ctx.exit();
            return;
        }
        next();
    };
}
function isFresh(req: IncomingMessage, res: ServerResponse) {
    return fresh(req.headers, {
        etag: res.getHeader("ETag"),
        "last-modified": res.getHeader("Last-Modified"),
    });
}
