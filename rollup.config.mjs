import commonjs from "@rollup/plugin-commonjs";
import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import rollupExternalModules from "rollup-external-modules";
import { terser } from "rollup-plugin-terser";
import ts from "rollup-plugin-ts";

const banner = `#!/usr/bin/env node`;
const terserplugin = terser({
    compress: {
        ecma: 2015,
        toplevel: true,
        unused: true,

        drop_debugger: true,
    },
    module: true,
    mangle: true,
    output: { comments: false, beautify: true },
});
export default defineConfig([
    {
        external: rollupExternalModules,

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
    {
        external: rollupExternalModules,

        input: "./src/index.ts",
        output: [
            {
                banner,
                sourcemap: true,
                file: "./dist/index.js",
                format: "esm",
            },
        ],
        plugins: [ts(), resolve(), commonjs(), terserplugin, json()],
    },
]);
