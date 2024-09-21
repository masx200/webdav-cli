import { main } from "./main";
import minimist from "minimist";
// #!/usr/bin/env node
import process from "process";
const argv = minimist(process.argv.slice(2),{string:["username","password"]});
main(argv).catch(console.error);
