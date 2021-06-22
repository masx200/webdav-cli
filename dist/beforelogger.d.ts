import { HTTPRequestContext } from "./webdav-cli.server";
export declare function beforelogger(): (
    ctx: HTTPRequestContext,
    next: () => void,
) => Promise<void>;
