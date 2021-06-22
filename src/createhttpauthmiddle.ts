import { HTTPRequestContext } from "./index";
import { createhttpauth } from "./http-auth";

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
