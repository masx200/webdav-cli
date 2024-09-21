import { HTTPRequestContext } from "./index.ts";
import { createhttpauth } from "./create-http-auth.ts";

export function createhttpauthmiddle(
    username: string,
    password: string,
    authentication: "HTTPDigestAuthentication" | "HTTPBasicAuthentication",
): (ctx: HTTPRequestContext, next: () => void) => void {
    return createhttpauth({
        user: username,
        pass: password,
        authentication,
    });
}
