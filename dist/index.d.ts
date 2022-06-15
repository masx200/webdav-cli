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
export { WebdavCli, HTTPRequestContext };
