export function beforelogger() {
    return async (ctx, next) => {
        const { url, headers, method } = ctx.request;
        console.log(">> ", method, url, headers);
        next();
    };
}
