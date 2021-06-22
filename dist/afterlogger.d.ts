import { HTTPRequestContext } from "./webdav-cli.server";
export declare function afterlogger(): (
    arg: HTTPRequestContext,
    next: () => void,
) => void;
