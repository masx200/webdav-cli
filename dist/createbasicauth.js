"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createbasicauth = void 0;
const http_auth_1 = __importDefault(require("http-auth"));
function createbasicauth(realm, user, pass) {
    return http_auth_1.default.basic(
        {
            realm,
        },
        (username, password, callback) => {
            callback(username === user && password === pass);
        },
    );
}
exports.createbasicauth = createbasicauth;
