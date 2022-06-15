import process from "process";
export function showhelp() {
    console.log(
        [
            "usage: webdav-cli [options]",
            "",
            "options:",
            "  --path,-pa        Path to folder [process.cwd()]",
            "  --host,-ho         Host to use [0.0.0.0]",
            "  --port,-po       Port to use [1900]",
            "  --digest,-dg     Enable digest authentication [basic]",
            "  --username,-u   Username for basic/digest authentication [random]",
            "  --password,-ps   Password for basic/digest authentication [random]",
            "  --disableAuthentication,-da  The server file becomes read-only without Authentication.[false]",
            "  --ssl,-s        Enable https [false]",
            "  --methodsWithoutAuthentication          methods Without Authentication[undefined]",
            "  --sslKey     Path to ssl key file [self-signed]",
            "  --sslCert    Path to ssl cert file [self-signed]",
            "  --help,-h       Print this list and exit",
            // "  --version,-v     Print the version and exit.",
            "  --rights,-r     Comma separated values without spaces [all]",
            `
    'all', 'canCreate', 'canDelete', 'canMove', 'canRename', 
    'canAppend', 'canWrite', 'canRead', 'canSource', 
    'canGetMimeType', 'canGetSize', 'canListLocks', 
    'canSetLock', 'canRemoveLock', 'canGetAvailableLocks', 
    'canGetLock', 'canAddChild', 'canRemoveChild', 
    'canGetChildren', 'canSetProperty', 'canGetProperty', 
    'canGetProperties', 'canRemoveProperty', 'canGetCreationDate', 
    'canGetLastModifiedDate', 'canGetWebName', 'canGetType'`,
            "",
            "env:",
            "  WEBDAV_CLI_PATH, WEBDAV_CLI_HOST, WEBDAV_CLI_PORT,",
            "  WEBDAV_CLI_USERNAME, WEBDAV_CLI_PASSWORD, WEBDAV_CLI_DIGEST,",
            "  WEBDAV_CLI_SSL, WEBDAV_CLI_SSL_KEY, WEBDAV_CLI_SSL_CERT,",
            "  WEBDAV_CLI_AUTO_INDEX, WEBDAV_CLI_RIGHTS",
            "  WEBDAV_CLI_DISABLE_AUTHENTICATION",
            "",
        ].join("\n"),
    );
    process.exit();
}
