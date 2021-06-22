import { HTTPRequestContext } from "./index";
export declare function createhttpauthmiddle(
    username: string,
    password: string,
    authentication: "HTTPDigestAuthentication" | "HTTPBasicAuthentication",
): (ctx: HTTPRequestContext, next: () => void) => void;
