import { HTTPRequestContext } from "./webdav-cli.server.js";

export function propfindchecker() {
    return (arg: HTTPRequestContext, next: () => void) => {
        const { headers, method } = arg.request;
        const { depth } = headers;
        if (method === "PROPFIND" && depth !== "0" && depth !== "1") {
            arg.setCode(403);
            arg.exit();
        } else {
            next();
        }
    };
}
