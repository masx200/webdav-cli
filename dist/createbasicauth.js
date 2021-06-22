import httpauth from "http-auth";
export function createbasicauth(realm, user, pass) {
    return httpauth.basic(
        {
            realm,
        },
        (username, password, callback) => {
            callback(username === user && password === pass);
        },
    );
}
