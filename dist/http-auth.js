"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createhttpauth = void 0;
const http_auth_1 = __importDefault(require("http-auth"));
const utils_js_1 = __importDefault(require("http-auth/src/auth/utils.js"));
function createhttpauth(options) {
    const realm = "Default realm";
    const auth =
        options.authentication === "HTTPBasicAuthentication"
            ? createbasicauth()
            : createdigestauth();
    return (ctx, next) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };
    function createdigestauth() {
        return http_auth_1.default.digest(
            {
                realm,
            },
            (username, callback) => {
                if (username === options.user) {
                    callback(
                        utils_js_1.default.md5(
                            `${username}:${realm}:${options.pass}`,
                        ),
                    );
                } else {
                    callback();
                }
            },
        );
    }
    function createbasicauth() {
        return http_auth_1.default.basic(
            {
                realm,
            },
            (username, password, callback) => {
                callback(
                    username === options.user && password === options.pass,
                );
            },
        );
    }
}
exports.createhttpauth = createhttpauth;
