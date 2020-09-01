'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebdavCli = void 0;
const fs = require('fs');
const path_1 = require('path');
const webdav_server_1 = require('webdav-server');
const webdav_cli_utils_1 = require('./webdav-cli.utils');
const webdav_cli_constants_1 = require('./webdav-cli.constants');
class WebdavCli {
    constructor(config) {
        this.config = this.getConfig(config);
    }
    getConfig(config) {
        const selfSignedKey = path_1.join(
            __dirname,
            '/../certs/self-signed.key.pem',
        );
        const selfSignedCert = path_1.join(
            __dirname,
            '/../certs/self-signed.cert.pem',
        );
        const path = config.path || process.cwd();
        const host = config.host || '127.0.0.1';
        const port = config.port || 1900;
        const digest = Boolean(config.digest);
        let username = (
            config.username || webdav_cli_utils_1.getRandomString(16)
        ).toString();
        let password = (
            config.password || webdav_cli_utils_1.getRandomString(16)
        ).toString();
        const ssl = Boolean(config.ssl);
        const sslKey = ssl
            ? fs.readFileSync(config.sslKey || selfSignedKey).toString()
            : '';
        const sslCert = ssl
            ? fs.readFileSync(config.sslCert || selfSignedCert).toString()
            : '';
        const disableAuthentication = Boolean(config.disableAuthentication);
        if (disableAuthentication) {
            config.rights = config.rights || ['canRead'];
            username = '';
            password = '';
        }
        const rights = (config.rights || ['all']).filter((item) =>
            webdav_cli_constants_1.RIGHTS.includes(item),
        );
        const url = `${ssl ? 'https' : 'http'}://${host}:${port}`;
        const directory = Boolean(config.directory);
        const autoIndex = Boolean(config.autoIndex);
        return {
            host,
            path,
            port,
            username,
            digest,
            password,
            ssl,
            sslCert,
            sslKey,
            rights,
            url,
            disableAuthentication,
            directory,
            autoIndex,
        };
    }
    async start() {
        const config = this.config;
        const userManager = new webdav_server_1.v2.SimpleUserManager();
        const user = userManager.addUser(
            config.username,
            config.password,
            false,
        );
        const privilegeManager = new webdav_server_1.v2.SimplePathPrivilegeManager();
        privilegeManager.setRights(user, '/', config.rights);
        const authentication = config.digest
            ? 'HTTPDigestAuthentication'
            : 'HTTPBasicAuthentication';
        const server = new webdav_server_1.v2.WebDAVServer({
            httpAuthentication: config.disableAuthentication
                ? {
                      askForAuthentication: () => ({}),
                      getUser: (ctx, gotUserCallback) => {
                          userManager.getDefaultUser((defaultUser) => {
                              privilegeManager.setRights(
                                  defaultUser,
                                  '/',
                                  config.rights,
                              );
                              gotUserCallback(null, defaultUser);
                          });
                      },
                  }
                : new webdav_server_1.v2[authentication](
                      userManager,
                      'Default realm',
                  ),
            privilegeManager: privilegeManager,
            https: config.ssl
                ? { cert: config.sslCert, key: config.sslKey }
                : undefined,
            port: config.port,
            hostname: config.host,
        });
        server.config = config;
        server.beforeRequest(async (ctx, next) => {
            const { url, headers, method } = ctx.request;
            console.log({ method, url }, headers);
            next();
        });
        server.afterRequest((arg, next) => {
            const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} ${arg.response.statusMessage}`;
            console.log(log);
            next();
        });
        await server.setFileSystemAsync(
            '/',
            new webdav_server_1.v2.PhysicalFileSystem(config.path),
        );
        await server.startAsync(config.port);
        const logs = [
            `Server running at ${config.url}`,
            `[rights]: ${config.rights}`,
            `[digest]: ${config.digest}`,
            `username: ${config.username}`,
            `password: ${config.password}`,
            'Hit CTRL-C to stop the server',
            'Run with --help to print help',
        ];
        console.log(logs.join('\n'));
        return server;
    }
}
exports.WebdavCli = WebdavCli;
