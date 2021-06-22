import httpauth from "http-auth";

export function createbasicauth(
    realm: string,
    user: string,
    pass: string,
): ReturnType<typeof httpauth.basic> {
    return httpauth.basic(
        {
            realm,
        },
        (username, password, callback) => {
            // Custom authentication method.
            callback(username === user && password === pass);
        },
    );
}
