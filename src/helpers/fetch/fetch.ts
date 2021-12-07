import fetch, { Response, RequestInit } from "node-fetch";
import { AbortController as AbortControllerNpm } from "abort-controller";
import { StatusCodes } from "http-status-codes";
import { Stopwatch } from "../stopwatch";
import { HttpRequest, HttpResponse } from "../../contracts";
import { buildUrl, replacePathParams } from "../../utils";
import { DEFAULT_HTTP_TIMEOUT } from "../../constants";

// AbortController was added in node v14.17.0 globally
const AbortController = globalThis?.AbortController || AbortControllerNpm;

export async function fetchService<TRequest extends Record<string | number, unknown>, TResponse>(baseReq: HttpRequest<TRequest>): Promise<HttpResponse<TResponse>> {
    const { options, payload, url: baseUrl, method = "GET" } = baseReq;
    const { customHeaders, queryParams, pathParams, timeout = DEFAULT_HTTP_TIMEOUT } = options || {};
    const controller = new AbortController();
    const timeoutFetch = setTimeout(() => {
        controller.abort();
    }, timeout);

    let url = replacePathParams(baseUrl, pathParams);
    if (queryParams) {
        url = buildUrl(url, queryParams);
    }

    const requestOptions: RequestInit = {
        headers: method === "GET" ? { Accept: "application/json" } : { "Content-Type": "application/json" },
        signal: controller.signal,
        ...options,
        method
    };

    if (payload) {
        requestOptions.body = options?.body || JSON.stringify(payload);
    }

    if (customHeaders) {
        requestOptions.headers = { ...requestOptions.headers, ...customHeaders };
    }

    const sw = new Stopwatch();
    let rawResponse: Response | undefined;
    try {
        rawResponse = await fetch(url, requestOptions);
        const response = await rawResponse.json() as TResponse;
        if (!rawResponse.ok) {
            const message = `${method} Request unsuccessful response`;
            return { isGood: false, error: message, statusCode: rawResponse.status, response, elapsed: sw.getElapsedMs() };
        }

        return { isGood: true, statusCode: rawResponse.status || StatusCodes.OK, response, elapsed: sw.getElapsedMs() };
    } catch (err) {
        const message = `Failed on ${method} Request`;
        return { isGood: false, error: (err as Error)?.message || message, statusCode: rawResponse?.status, elapsed: sw.getElapsedMs() };
    } finally {
        clearTimeout(timeoutFetch);
    }

}
