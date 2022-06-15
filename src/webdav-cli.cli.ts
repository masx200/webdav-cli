// #!/usr/bin/env node
import process from "process";
import minimist from "minimist";
import { main } from "./main";
const argv = minimist(process.argv.slice(2));
main(argv).catch(console.error);
