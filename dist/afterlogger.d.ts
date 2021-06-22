import { HTTPRequestContext } from "./webdav-cli.server.js";
export declare function afterlogger(): (
    arg: HTTPRequestContext,
    next: () => void,
) => void;
