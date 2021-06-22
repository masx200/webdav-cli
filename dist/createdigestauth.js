import httpauth from "http-auth";
import utils from "http-auth/src/auth/utils.js";
export function createdigestauth(realm, user, pass) {
    return httpauth.digest(
        {
            realm,
        },
        (username, callback) => {
            if (username === user) {
                callback(utils.md5(`${username}:${realm}:${pass}`));
            } else {
                callback();
            }
        },
    );
}
