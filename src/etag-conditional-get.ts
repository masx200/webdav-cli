import etag from "etag";
import fs from "fs";
import path from "path";
import { v2 as webdav } from "webdav-server";
export function etag_conditional_get(publicpath: string) {
    return function middleware(
        ctx: webdav.HTTPRequestContext,
        next: () => void,
    ) {
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
            ctx.request.headers["if-none-match"] ===
            ctx.response.getHeader("etag")
        ) {
            ctx.response.statusCode = 304;
            ctx.response.end();
            ctx.exit();
            return;
        }
        next();
    };
}
