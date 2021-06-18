import { v2 as webdav } from "webdav-server";
export declare function etag_conditional_get(
    publicpath: string,
): (ctx: webdav.HTTPRequestContext, next: () => void) => void;
