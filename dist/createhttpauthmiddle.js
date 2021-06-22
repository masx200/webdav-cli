import { createhttpauth } from "./create-http-auth.js";
export function createhttpauthmiddle(username, password, authentication) {
    return createhttpauth({
        user: username,
        pass: password,
        authentication,
    });
}
