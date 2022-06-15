import { fileURLToPath } from "url";
import { assert } from "vitest";
import { main } from "../src";
import { test } from "vitest";
import { fetch } from "undici";
test("post-ok-index2-file", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index2.html`, {
            method: "POST",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
            body: "hello-world---",
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 201);
        const response2 = await fetch(`http://127.0.0.1:${port}/index2.html`, {
            method: "GET",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
            // body: "hello-world---",
        });
        console.log(response2);
        assert(response2.ok);
        const text = await response2.text();
        assert.equal(text, "hello-world---");
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("put-ok-index2-file", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index2.html`, {
            method: "PUT",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
            body: "hello----------world",
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 200);
        const response2 = await fetch(`http://127.0.0.1:${port}/index2.html`, {
            method: "GET",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
            // body: "hello-world---",
        });
        console.log(response2);
        assert(response2.ok);
        const text = await response2.text();
        assert.equal(text, "hello----------world");
        // const text = await response.text();
        // assert.equal(text, "hello world");
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});

test("delete-ok-index2-file", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index2.html`, {
            method: "DELETE",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 200);
        const response2 = await fetch(`http://127.0.0.1:${port}/index2.html`, {
            method: "GET",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
            // body: "hello-world---",
        });
        console.log(response2);
        assert(!response2.ok);
        assert.equal(response2.status, 404);
        // const text = await response2.text();
        // assert.equal(text, "hello----------world");
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
