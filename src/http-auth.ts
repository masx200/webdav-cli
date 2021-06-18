export function httpauth(options: {}) {
    return (ctx: webdav.HTTPRequestContext, next: () => void) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };
}
import { v2 as webdav } from "webdav-server";
import auth from "http-auth";
