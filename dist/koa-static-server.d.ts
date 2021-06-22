import { v2 as webdav } from "webdav-server";
export declare function koa_static_server(
    publicpath: string,
): (ctx: webdav.HTTPRequestContext, next: () => void) => void;
