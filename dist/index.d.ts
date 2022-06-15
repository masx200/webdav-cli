import { BasicPrivilege } from "webdav-server";
import { v2 as webdav } from "webdav-server";
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
    config: WebdavCliConfig;
    server: webdav.WebDAVServer;
    auth_middle: (ctx: webdav.HTTPRequestContext, next: () => void) => void;
    constructor(config: Partial<WebdavCliConfig>);
    getConfig(config: Partial<WebdavCliConfig>): WebdavCliConfig;
    init(): webdav.WebDAVServer;
    get_authentication(config: WebdavCliConfig): "HTTPDigestAuthentication" | "HTTPBasicAuthentication";
    start(): Promise<void>;
}
type HTTPRequestContext = webdav.HTTPRequestContext;
declare function getRandomString(length: number): string;
export { RIGHTS, WebdavCliRights, WebdavCliConfig, WebdavCliServer, WebdavCli, HTTPRequestContext, getRandomString };
