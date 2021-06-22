import { HTTPRequestContext } from "./webdav-cli.server";
export declare function propfindchecker(): (
    arg: HTTPRequestContext,
    next: () => void,
) => void;
