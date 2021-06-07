import { WebdavCliServer, WebdavCliConfig } from "./webdav-cli.interfaces";
export declare class WebdavCli {
    config: WebdavCliConfig;
    constructor(config: Partial<WebdavCliConfig>);
    getConfig(config: Partial<WebdavCliConfig>): WebdavCliConfig;
    start(): Promise<WebdavCliServer>;
}
