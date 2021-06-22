import { v2 as webdav } from "webdav-server";
import { WebdavCliConfig } from "./webdav-cli.interfaces";
export declare class WebdavCli {
    config: WebdavCliConfig;
    server: webdav.WebDAVServer;
    constructor(config: Partial<WebdavCliConfig>);
    getConfig(config: Partial<WebdavCliConfig>): WebdavCliConfig;
    init(): webdav.WebDAVServer;
    start(): Promise<void>;
}
export declare type HTTPRequestContext = webdav.HTTPRequestContext;
