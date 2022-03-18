import { HotRequests, HotServer } from "../../../src";

let testHotServer: HotServer | undefined;
const server = {
    host: "localhost",
    port: 8130
};

describe("HotServer E2E Test Suite", () => {
    beforeAll(() => {
        testHotServer = new HotServer({
            host: server.host,
            port: server.port,
            staticRoute: {
                html: "./tests/mocks/test.html",
                route: "/staticHtml"
            },
            routes: {
                "/json": {
                    onSuccess: () => {
                        return {
                            result: {
                                some: "record"
                            }
                        };
                    }
                },
                "/text": {
                    responseHeaders: {
                        "Content-Type": "text/plain"
                    },
                    onSuccess: () => {
                        return {
                            result: "My text response."
                        };
                    }
                }
            }
        });
    });

    it("should serve a static page", async () => {
        const result = await HotRequests.fetch({
            method: "GET",
            url: `http://${server.host}:${server.port}/staticHtml`,
            options: {
                eventName: "e2eTest",
                timeout: 5000
            }
        });

        expect(result).toEqual(expect.objectContaining({
            success: true,
            status: 200,
            elapsed: expect.any(Number),
            result: expect.stringContaining("<html>")
        }));
    });


    it("should expose an application/json endpoint", async () => {
        const result = await HotRequests.fetch({
            method: "GET",
            url: `http://${server.host}:${server.port}/json`,
            options: {
                eventName: "e2eTest",
                timeout: 5000
            }
        });

        expect(result).toEqual(expect.objectContaining({
            success: true,
            status: 200,
            elapsed: expect.any(Number),
            result: {
                success: true,
                status: 200,
                elapsed: expect.any(Number),
                result: { some: "record" }
            }
        }));
    });

    it("should expose a text/plain endpoint", async () => {
        const result = await HotRequests.get({
            url: `http://${server.host}:${server.port}/text`,
            options: {
                eventName: "e2eTest",
                timeout: 5000,
                headers: { Accept: "text/plain" }
            }
        });

        expect(result).toEqual(expect.objectContaining({
            success: true,
            status: 200,
            elapsed: expect.any(Number),
            result: "My text response."
        }));
    });

    afterAll(async () => {
        await testHotServer?.stop();
    });
});