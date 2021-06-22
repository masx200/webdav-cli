"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propfindchecker = void 0;
function propfindchecker() {
    return (arg, next) => {
        const { headers, method } = arg.request;
        const { depth } = headers;
        if (method === "PROPFIND" && depth !== "0" && depth !== "1") {
            arg.setCode(403);
            arg.exit();
        } else {
            next();
        }
    };
}
exports.propfindchecker = propfindchecker;
