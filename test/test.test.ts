import { fileURLToPath } from "url";
import { test } from "vitest";
import { main } from "../src/main";
import assert from "assert";
import { fetch } from "undici";

test("DELETE-fail-index-file-disableAuthentication", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({
        path,
        port,
        host,
        username,
        password,
        disableAuthentication: true,
    });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index.html`, {
            method: "DELETE",
            headers: {
                // Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(!response.ok);
        assert.equal(response.status, 405);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("post-fail-index-file-disableAuthentication", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({
        path,
        port,
        host,
        username,
        password,
        disableAuthentication: true,
    });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index.html`, {
            method: "POST",
            headers: {
                // Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(!response.ok);
        assert.equal(response.status, 405);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("get-ok-index-file-disableAuthentication", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({
        path,
        port,
        host,
        username,
        password,
        disableAuthentication: true,
    });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index.html`, {
            method: "GET",
            headers: {
                // Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 200);
        const text = await response.text();
        assert.equal(text, "hello world");
        assert(response.headers.get("content-type")?.startsWith("text/html"));
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});

test("get-Unauthorized", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "GET",
            headers: {},
        });
        console.log(response);
        assert(!response.ok);
        assert.equal(response.status, 401);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});

test("get-ok-dir-index", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "GET",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 200);
        const text = await response.text();
        assert(text.startsWith("<!DOCTYPE html>"));
        assert(text.endsWith("</html>"));
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
    // await webdav.server.stopAsync();
});
test("get-ok-index-file", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index.html`, {
            method: "GET",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 200);
        const text = await response.text();
        assert.equal(text, "hello world");
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("get-ok-index-file-methodsWithoutAuthentication", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({
        path,
        port,
        host,
        username,
        password,
        methodsWithoutAuthentication: ["GET"],
    });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index.html`, {
            method: "GET",
            headers: {
                // Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 200);
        const text = await response.text();
        assert.equal(text, "hello world");
        assert(response.headers.get("content-type")?.startsWith("text/html"));
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("get-not-found-index-file", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = 20000 + Math.floor(Math.random() * 45536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}/index5.html`, {
            method: "GET",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(!response.ok);
        assert.equal(response.status, 404);
        // const text = await response.text();
        // assert.equal(text, "hello world");
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
