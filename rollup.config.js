import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import ts from "rollup-plugin-ts";
// import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { defineConfig } from "rollup";
const banner = `#!/usr/bin/env node`;
const terserplugin = terser({
    compress: {
        ecma: 2015,
        toplevel: true,
        unused: true,
        // drop_console: true,
        drop_debugger: true,
        // pure_funcs: ["console.log"],
    },
    module: true,
    mangle: true,
    output: { comments: false, beautify: true },
});
export default defineConfig([
    {
        external: [
            "minimist",
            "koa",
            "webdav-server",
            "depd",
            "bluebird",
            "@masx200/serve-cli",
            "http-auth",
            "process",
            "net",
            "koa-logger",
            "url",
            "http",
            "https",
        ],
        input: "./src/webdav-cli.cli.ts",
        output: [
            {
                banner,
                sourcemap: true,
                file: "./dist/webdav-cli.cli.js",
                format: "esm",
            },
        ],
        plugins: [ts(), resolve(), commonjs(), terserplugin, json()],
    },
]);
