import { HTTPRequestContext } from "./webdav-cli.server.js";

export function afterlogger() {
    return (arg: HTTPRequestContext, next: () => void) => {
        const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} `;
        // server.emit('log', null, null, '/', log);
        console.log(log);
        next();
    };
}
