import { createbasicauth } from "./createbasicauth.js";
import { createdigestauth } from "./createdigestauth.js";
export function createhttpauth(options) {
    const realm = "Default realm";
    const auth =
        options.authentication === "HTTPBasicAuthentication"
            ? createbasicauth(realm, options.user, options.pass)
            : createdigestauth(realm, options.user, options.pass);
    return (ctx, next) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };
}
