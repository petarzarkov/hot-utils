/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createReadStream } from "fs";
import { Server, createServer, IncomingMessage, ServerResponse } from "http";
import { HOT_SERVER } from "../constants";
import { HttpResponse, OneOrOther } from "../contracts";
import { HotLogger, HotWatch, IHotLogger } from "../helpers";

interface IHotServer {
    host?: string;
    port?: number;
    routes?: Record<string, Middleware>;
    defaultHeader?: Record<string, string>;
    /**
     * @default { route: "/" }
     */
    staticRoute?: OneOrOther<{ html: string }, { html: string; route: string }>;
}

type OnSuccess<T> = {
    status?: number;
    result: T;
};
type OnError<T> = {
    error: string;
    stack?: string | undefined;
    status?: number;
    result?: T | undefined;
};

type Result = Record<string, unknown> | Array<Record<string, unknown>> | string;

type Middleware = {
    responseHeaders?: Record<string, string>;
    onSuccess: (req: IncomingMessage, res: ServerResponse, query?: Record<string, string>) =>
    Promise<OnSuccess<Result>> | OnSuccess<Result>;
    onError?: (req: IncomingMessage, res: ServerResponse, err: Error) =>
    Promise<OnError<Result> | OnError<Result>>;
} | { staticHtml: string };

/**
 * Simple http server.
 * Allows for custom route handling.
 * - Default response header is "Content-Type": "application/json"
 */
export class HotServer {
    private defaultHeader: Record<string, string>;
    private server: Server;
    private mdEvents?: Set<string>;
    private routes?: Map<string, Middleware & { event: string }>;
    private log: IHotLogger;

    constructor({
        host = HOT_SERVER.host,
        port = HOT_SERVER.port,
        routes,
        defaultHeader = { "Content-Type": "application/json" },
        staticRoute
    }: IHotServer = {}) {
        this.log = HotLogger.createLogger("@hot/server", [{ key: "event", values: ["/favicon.ico"] }]);
        this.defaultHeader = defaultHeader;
        this.routes = new Map();
        this.mdEvents = new Set();
        if (routes) {
            for (const md of Object.entries(routes)) {
                this.routes?.set(md[0], {
                    ...md[1],
                    event: md[0]
                });

                this.mdEvents.add(md[0]);
            }

        }
        if (staticRoute) {
            this.routes.set(staticRoute.route || "/", { event: staticRoute.route || "/", staticHtml: staticRoute.html });
            this.mdEvents.add(staticRoute.route || "/");
        }

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.server = createServer(this.handler);

        this.server.listen({
            port,
            host
        }, () => {
            this.log.info(`Server started on http://${host}:${port}/`);
        });
    }

    private handler = async (req: IncomingMessage, res: ServerResponse) => {
        const hw = new HotWatch();
        const rawUrl = new URL(req.url!, `http://${req.headers.host!}`);
        const query = Object.fromEntries([...rawUrl.searchParams.entries()]);
        const event = rawUrl.pathname;
        const md = req?.url && this.mdEvents?.has(event) ? this.routes?.get(event) : undefined;
        const {
            onSuccess,
            onError,
            responseHeaders,
        } = md && "onSuccess" in md && md || {};
        const { staticHtml } = md && "staticHtml" in md && md || {};

        try {
            const { headers, httpVersion, method, socket: { remoteAddress, remoteFamily }, url } = req || {};
            this.log.trace(`<-- ${method!} ${url!}`, {
                method,
                url,
                event,
                query,
                httpVersion,
                remoteAddress,
                remoteFamily,
                headers
            });

            if (!md) {
                return this.response({
                    req,
                    res,
                    event,
                    headers: responseHeaders,
                    http: { success: false, status: 404, elapsed: hw.getElapsedMs(), error: "Resource not found." }
                });
            }

            const mdSuccess = await onSuccess?.(req, res, query);
            this.response({
                req,
                res,
                event,
                headers: responseHeaders,
                staticHtml,
                http: mdSuccess ?
                    { ...mdSuccess, elapsed: hw.getElapsedMs(), success: true, status: mdSuccess.status || 200 }
                    :
                    { success: true, status: 200, elapsed: hw.getElapsedMs() }
            });
        } catch (error) {
            const mdErr = await onError?.(req, res, <Error>error);
            this.log.error("Error on request handling", { err: <Error>error, event });

            this.response({
                req,
                res,
                event,
                headers: responseHeaders,
                staticHtml,
                http: mdErr ?
                    { ...mdErr, elapsed: hw.getElapsedMs(), success: false, status: mdErr.status || 500 }
                    :
                    { success: false, status: 500, error: "Error on request handling", elapsed: hw.getElapsedMs() }
            });
        }
    };

    private response = (
        { req, res, http, headers, staticHtml, event }:
        {
            req: IncomingMessage;
            res: ServerResponse;
            event: string;
            http: Partial<HttpResponse<Result>>;
            headers?: Record<string, string>;
            staticHtml?: string;
        }) => {
        const { method, url } = req;
        const { status, result, ...rest } = http;
        this.log.trace(`--> ${method!} ${url!}`, {
            status,
            url,
            event,
            ...typeof(result) !== "string" ? { result: http } : { result: { rest }}
        });

        const finalHeaders = {
            ...this.defaultHeader,
            ...headers,
            ...staticHtml && { "Content-Type": "text/html" }
        };
        res.writeHead(status!, finalHeaders);
        if (finalHeaders?.["Content-Type"] === "application/json") {
            res.write(JSON.stringify(http || {}));
            res.end();
        }

        if (!staticHtml && typeof(result) === "string") {
            res.write(result);
            res.end();
        }

        if (staticHtml) {
            createReadStream(staticHtml).pipe(res);
        }

    };

    public stop = () => {
        return new Promise(resolve => this.server.close(() => {
            this.log.info("Server stopped.");
            resolve("OK");
        }));
    };
}