"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createhttpauth = void 0;
const createbasicauth_1 = require("./createbasicauth");
const createdigestauth_1 = require("./createdigestauth");
function createhttpauth(options) {
    const realm = "Default realm";
    const auth =
        options.authentication === "HTTPBasicAuthentication"
            ? createbasicauth_1.createbasicauth(
                  realm,
                  options.user,
                  options.pass,
              )
            : createdigestauth_1.createdigestauth(
                  realm,
                  options.user,
                  options.pass,
              );
    return (ctx, next) => {
        auth.check((req, res) => {
            next();
        })(ctx.request, ctx.response);
    };
}
exports.createhttpauth = createhttpauth;
