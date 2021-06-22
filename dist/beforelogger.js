"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforelogger = void 0;
function beforelogger() {
    return async (ctx, next) => {
        const { url, headers, method } = ctx.request;
        console.log(">> ", method, url, headers);
        next();
    };
}
exports.beforelogger = beforelogger;
