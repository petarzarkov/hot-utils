import fetch, { Response, RequestInit } from "node-fetch";
import { AbortController as AbortControllerNpm } from "abort-controller";
import { StatusCodes } from "http-status-codes";
import { Stopwatch } from "../stopwatch";
import { HttpMethods, HttpRequest, HttpResponse } from "../../contracts";
import { HotUrl } from "../../utils";
import { DEFAULT_HTTP_TIMEOUT } from "../../constants";

export class HotRequests {
    public static get AC() {
        return globalThis?.AbortController || AbortControllerNpm;
    }

    public static async fetch<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>): Promise<HttpResponse<TResponse>> {
        const { options, payload, url: baseUrl, method = HttpMethods.GET } = req;
        const { headers, queryParams, pathParams, timeout = DEFAULT_HTTP_TIMEOUT, path } = options || {};
        const controller = new this.AC();
        const timeoutFetch = setTimeout(() => {
            controller.abort();
        }, timeout);

        const url = HotUrl.build({
            base: baseUrl,
            path,
            pathParams,
            queryParams
        });

        const requestOptions: RequestInit = {
            headers: method === HttpMethods.GET ? { Accept: "application/json" } : { "Content-Type": "application/json" },
            signal: controller.signal,
            ...options,
            method
        };

        if (payload) {
            requestOptions.body = options?.body || JSON.stringify(payload);
        }

        if (headers) {
            requestOptions.headers = { ...requestOptions.headers, ...headers };
        }

        const sw = new Stopwatch();
        let rawResponse: Response | undefined;
        try {
            rawResponse = await fetch(url, requestOptions);
            const response = await this.parseResponse(rawResponse) as TResponse;
            if (!rawResponse.ok) {
                const message = `Hot ${method} request not successful`;
                return { isGood: false, error: message, statusCode: rawResponse.status, response, elapsed: sw.getElapsedMs() };
            }

            return { isGood: true, statusCode: rawResponse.status || StatusCodes.OK, response, elapsed: sw.getElapsedMs() };
        } catch (err) {
            const message = `Hot ${method} request not successful`;
            return { isGood: false, error: (err as Error)?.message || message, statusCode: rawResponse?.status || StatusCodes.INTERNAL_SERVER_ERROR, elapsed: sw.getElapsedMs() };
        } finally {
            clearTimeout(timeoutFetch);
        }

    }

    public static parseResponse = async <Res>(response: Response) => {
        let resT: string | undefined;
        let resJ: Res;
        try {
            resT = await response.text();
            resJ = JSON.parse(resT) as unknown as Res;
        } catch (error) {
            return resT || response.statusText;
        }

        return resJ as unknown as Res;
    };

    public static head<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.HEAD });
    }

    public static get<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.GET });
    }

    public static post<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.POST });
    }

    public static put<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.PUT });
    }

    public static patch<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.PATCH });
    }

    public static delete<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.DELETE });
    }

    public static options<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.OPTIONS });
    }

    public static trace<TRequest extends Record<string | number, unknown>, TResponse>(req: Omit<HttpRequest<TRequest>, "method">) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.TRACE });
    }

}

