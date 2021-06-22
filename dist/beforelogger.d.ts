import { HTTPRequestContext } from "./webdav-cli.server.js";
export declare function beforelogger(): (
    ctx: HTTPRequestContext,
    next: () => void,
) => Promise<void>;
