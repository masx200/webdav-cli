import httpauth from "http-auth";
//@ts-ignore
import utils from "http-auth/src/auth/utils.js";

export function createdigestauth(
    realm: string,
    user: string,
    pass: string,
): ReturnType<typeof httpauth.digest> {
    return httpauth.digest(
        {
            realm,
        },
        // Expecting md5(username:realm:password) in callback.
        (username, callback) => {
            if (username === user) {
                callback(utils.md5(`${username}:${realm}:${pass}`));
            } else {
                callback();
            }
        },
    );
}
