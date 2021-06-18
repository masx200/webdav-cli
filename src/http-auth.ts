import { v2 as webdav } from "webdav-server";
import httpauth from "http-auth";

export function createhttpauth(options: {
    user: string;
    pass: string;
    authentication: "HTTPDigestAuthentication" | "HTTPBasicAuthentication";
}) {
    const auth =
        options.authentication === "HTTPBasicAuthentication"
            ? httpauth.basic(
                  {
                      realm: "Default realm",
                  },
                  (username, password, callback) => {
                      // Custom authentication method.
                      callback(
                          username === options.user &&
                              password === options.pass,
                      );
                  },
              )
            : httpauth.digest(
                  {
                      realm: "Default realm",
                  },
                  (username, callback) => {
                      callback();
                  },
              );
    return (ctx: webdav.HTTPRequestContext, next: () => void) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };
}
