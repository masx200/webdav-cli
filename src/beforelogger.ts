import { HTTPRequestContext } from "./webdav-cli.server.js";

export function beforelogger() {
    return async (ctx: HTTPRequestContext, next: () => void) => {
        const { url, headers, method } = ctx.request;
        console.log(">> ", method, url, headers);
        next();
    };
}
