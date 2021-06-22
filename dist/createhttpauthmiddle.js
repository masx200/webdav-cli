"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createhttpauthmiddle = void 0;
const http_auth_1 = require("./http-auth");
function createhttpauthmiddle(username, password, authentication) {
    return http_auth_1.createhttpauth({
        user: username,
        pass: password,
        authentication,
    });
}
exports.createhttpauthmiddle = createhttpauthmiddle;
