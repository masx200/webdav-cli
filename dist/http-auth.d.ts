import { v2 as webdav } from "webdav-server";
export declare function createhttpauth(options: {
    user: string;
    pass: string;
    authentication: "HTTPDigestAuthentication" | "HTTPBasicAuthentication";
}): (ctx: webdav.HTTPRequestContext, next: () => void) => void;
