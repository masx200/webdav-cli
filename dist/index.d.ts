/// <reference types="minimist" />
import { BasicPrivilege } from "webdav-server";
import { v2 as webdav } from "webdav-server";
import minimist from "minimist";
type WebdavCliRights = BasicPrivilege[];
interface WebdavCliConfig {
    path: string;
    host: string;
    port: number;
    digest: boolean;
    username: string;
    password: string;
    ssl: boolean;
    sslKey: string;
    sslCert: string;
    rights: WebdavCliRights;
    disableAuthentication?: boolean;
    url?: string;
    methodsWithoutAuthentication?: string[];
}
interface WebdavCliServer extends webdav.WebDAVServer {
    config: WebdavCliConfig;
}
declare const RIGHTS: WebdavCliRights;
declare class WebdavCli {
    #private;
    config: WebdavCliConfig;
    server: webdav.WebDAVServer;
    constructor(config: Partial<WebdavCliConfig>);
    start(): Promise<void>;
}
type HTTPRequestContext = webdav.HTTPRequestContext;
declare function getRandomString(length: number): string;
declare function main(argv: Partial<minimist.ParsedArgs>): Promise<WebdavCli>;
export { RIGHTS, WebdavCliRights, WebdavCliConfig, WebdavCliServer, WebdavCli, HTTPRequestContext, getRandomString, main };
