import httpauth from "http-auth";
export declare function createdigestauth(
    realm: string,
    user: string,
    pass: string,
): ReturnType<typeof httpauth.digest>;
