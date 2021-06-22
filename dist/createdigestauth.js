"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdigestauth = void 0;
const http_auth_1 = __importDefault(require("http-auth"));
const utils_js_1 = __importDefault(require("http-auth/src/auth/utils.js"));
function createdigestauth(realm, user, pass) {
    return http_auth_1.default.digest(
        {
            realm,
        },
        (username, callback) => {
            if (username === user) {
                callback(
                    utils_js_1.default.md5(`${username}:${realm}:${pass}`),
                );
            } else {
                callback();
            }
        },
    );
}
exports.createdigestauth = createdigestauth;
