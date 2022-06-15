import { fileURLToPath } from "url";
import { test } from "vitest";
import { main } from "../src/main";
import assert from "assert";
import { fetch } from "undici";
test("propfind-depth-Unauthorized", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 30000;
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    const response = await fetch("http://127.0.0.1:30000", {
        method: "PROPFIND",
        headers: {},
    });
    console.log(response);
    assert(!response.ok);
    assert.equal(response.status, 401);
    await webdav.server.stopAsync();
});
test("propfind-depth-Forbidden-no-depth", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 30000;
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    const response = await fetch("http://127.0.0.1:30000", {
        method: "PROPFIND",
        headers: { Authorization: "Basic " + btoa(username + ":" + password) },
    });
    console.log(response);
    assert(!response.ok);
    assert.equal(response.status, 403);
    await webdav.server.stopAsync();
});
test("propfind-depth-Forbidden-depth-2", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 30000;
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    const response = await fetch("http://127.0.0.1:30000", {
        method: "PROPFIND",
        headers: {
            depth: "2",
            Authorization: "Basic " + btoa(username + ":" + password),
        },
    });
    console.log(response);
    assert(!response.ok);
    assert.equal(response.status, 403);
    await webdav.server.stopAsync();
});
test("propfind-depth-ok-depth-0", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 30000;
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    const response = await fetch("http://127.0.0.1:30000", {
        method: "PROPFIND",
        headers: {
            depth: "0",
            Authorization: "Basic " + btoa(username + ":" + password),
        },
    });
    console.log(response);
    assert(response.ok);
    assert.equal(response.status, 207);
    await webdav.server.stopAsync();
});
test("propfind-depth-ok-depth-1", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 30000;
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    const response = await fetch("http://127.0.0.1:30000", {
        method: "PROPFIND",
        headers: {
            depth: "0",
            Authorization: "Basic " + btoa(username + ":" + password),
        },
    });
    console.log(response);
    assert(response.ok);
    assert.equal(response.status, 207);
    await webdav.server.stopAsync();
});
