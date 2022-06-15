import { fileURLToPath } from "url";
import { test } from "vitest";
import { main } from "../src/main";
import assert from "assert";
import { fetch } from "undici";

test("propfind-ok-depth-0-disableAuthentication", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
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
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
            headers: {
                depth: "0",
                // Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 207);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("propfind-Unauthorized", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
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
    // await webdav.server.stopAsync();
});
test("propfind-Forbidden-no-depth", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
            headers: {
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(!response.ok);
        assert.equal(response.status, 403);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
    // await webdav.server.stopAsync();
});
test("propfind-Forbidden-depth-2", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
            headers: {
                depth: "2",
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(!response.ok);
        assert.equal(response.status, 403);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
    // await webdav.server.stopAsync();
});
test("propfind-ok-depth-0", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
            headers: {
                depth: "0",
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 207);
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
    // await webdav.server.stopAsync();
});
test("propfind-ok-depth-1", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({ path, port, host, username, password });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
            headers: {
                depth: "0",
                Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 207);
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
test("propfind-ok-depth-1-methodsWithoutAuthentication", async () => {
    const path = fileURLToPath(new URL("../index/", import.meta.url));
    const port = Math.floor(Math.random() * 65536);
    const host = "127.0.0.1";
    const username = "root";
    const password = "root";
    const webdav = await main({
        path,
        port,
        host,
        username,
        password,
        methodsWithoutAuthentication: ["PROPFIND"],
    });
    try {
        const response = await fetch(`http://127.0.0.1:${port}`, {
            method: "PROPFIND",
            headers: {
                depth: "0",
                // Authorization: "Basic " + btoa(username + ":" + password),
            },
        });
        console.log(response);
        assert(response.ok);
        assert.equal(response.status, 207);
        assert(
            response.headers.get("content-type")?.startsWith("application/xml"),
        );
        // await webdav.server.stopAsync();
    } catch (error) {
        throw error;
    } finally {
        await webdav.server.stopAsync();
    }
});
