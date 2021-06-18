import { v2 as webdav } from "webdav-server";
import httpauth from "http-auth";
//@ts-ignore
import utils from "http-auth/src/auth/utils.js";

export function createhttpauth(options: {
    user: string;
    pass: string;
    authentication: "HTTPDigestAuthentication" | "HTTPBasicAuthentication";
}) {
    const realm = "Default realm";
    const auth =
        options.authentication === "HTTPBasicAuthentication"
            ? createbasicauth()
            : createdigestauth();
    return (ctx: webdav.HTTPRequestContext, next: () => void) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };

    function createdigestauth() {
        return httpauth.digest(
            {
                realm,
            },
            // Expecting md5(username:realm:password) in callback.
            (username, callback) => {
                if (username === options.user) {
                    callback(utils.md5(`${username}:${realm}:${options.pass}`));
                } else {
                    callback();
                }
            },
        );
    }

    function createbasicauth() {
        return httpauth.basic(
            {
                realm,
            },
            (username, password, callback) => {
                // Custom authentication method.
                callback(
                    username === options.user && password === options.pass,
                );
            },
        );
    }
}
