export function afterlogger() {
    return (arg, next) => {
        const log = `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} `;
        console.log(log);
        next();
    };
}
