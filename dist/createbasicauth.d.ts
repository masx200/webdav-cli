import httpauth from "http-auth";
export declare function createbasicauth(
    realm: string,
    user: string,
    pass: string,
): ReturnType<typeof httpauth.basic>;
