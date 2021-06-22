import { v2 as webdav } from "webdav-server";
//@ts-ignore
import { createbasicauth } from "./createbasicauth.js";
import { createdigestauth } from "./createdigestauth.js";

export function createhttpauth(options: {
    user: string;
    pass: string;
    authentication: "HTTPDigestAuthentication" | "HTTPBasicAuthentication";
}) {
    const realm = "Default realm";
    const auth =
        options.authentication === "HTTPBasicAuthentication"
            ? createbasicauth(realm, options.user, options.pass)
            : createdigestauth(realm, options.user, options.pass);
    return (ctx: webdav.HTTPRequestContext, next: () => void) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };
}
