"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterlogger = void 0;
function afterlogger() {
    return (arg, next) => {
        const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} `;
        console.log(log);
        next();
    };
}
exports.afterlogger = afterlogger;
