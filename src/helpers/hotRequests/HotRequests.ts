import fetch, { Response, RequestInit } from "node-fetch";
import { HotWatch } from "../hotWatch";
import { HttpMethods, HttpRequest, HttpResponse, ExpandRecursively } from "../../contracts";
import { HotUrl, HotObj } from "../../utils";
import { HOT_DEFAULT_HTTP_TIMEOUT } from "../../constants";
import { ErrorParams } from "../hotLogger";

export class HotRequests {
    public static async fetch<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest> & { method: `${HttpMethods}` }): Promise<HttpResponse<TResponse>> {
        const { options, payload, url: baseUrl, method = HttpMethods.GET } = req;
        const { headers, queryParams, pathParams, timeout = HOT_DEFAULT_HTTP_TIMEOUT, path, logger: rawLogger, eventName, requestId } = options || {};
        const logger = rawLogger === true ? console : rawLogger; // Copilot did this pepega
        const controller = new AbortController();
        const timeoutFetch = setTimeout(() => {
            controller.abort();
        }, timeout);

        const url = HotUrl.build({
            base: baseUrl,
            path,
            pathParams,
            queryParams
        });

        const event = eventName || url.substring(url.lastIndexOf("/"));
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

        if (logger) {
            logger.info("Sending request", HotObj.cleanUpNullablesDeep({ requestId, method, event, url, data: { request: payload } }));
        }
        const hw = new HotWatch();
        let rawResponse: Response | undefined;
        try {
            rawResponse = await fetch(url, requestOptions);
            const result = await this.parseResponse(rawResponse) as ExpandRecursively<TResponse>;
            if (!rawResponse.ok) {
                const message = "Request unsuccessful";
                if (logger) {
                    logger.warn(message, HotObj.cleanUpNullablesDeep({
                        requestId, method, event, url, duration: hw.getElapsedMs(), data: { request: payload, result, status: rawResponse.status }
                    }));
                }
                return {
                    success: false,
                    error: message,
                    stack: new Error().stack,
                    status: rawResponse.status,
                    result,
                    elapsed: hw.getElapsedMs()
                };
            }

            if (logger) {
                logger.info("Request successful", HotObj.cleanUpNullablesDeep({
                    requestId, method, event, url, duration: hw.getElapsedMs(), data: { request: payload, result, status: rawResponse.status }
                }));
            }
            return {
                success: true,
                status: rawResponse.status || 200,
                result,
                elapsed: hw.getElapsedMs()
            };
        } catch (err) {
            const isAborted = (err as Error)?.message.includes("abort");
            const message = isAborted ? "Request timed out" : "Request unsuccessful";
            if (logger) {
                logger.error(message, HotObj.cleanUpNullablesDeep({
                    requestId,
                    method,
                    event,
                    err: <Error>err,
                    url,
                    duration: hw.getElapsedMs(),
                    data: { request: payload, status: rawResponse?.status, rawResponse }
                }) as ErrorParams);
            }

            return {
                success: false,
                error: (err as Error)?.message || message,
                stack: (err as Error)?.stack || new Error().stack,
                status: isAborted ? 408 : (rawResponse?.status || 500),
                elapsed: hw.getElapsedMs()
            };
        } finally {
            clearTimeout(timeoutFetch);
        }

    }

    public static parseResponse = async <Res>(response: Response) => {
        const parsed: { responseText: string | null; responseJson: Res | null } = {
            responseText: null,
            responseJson: null
        };
        try {
            parsed.responseText = await response.text();
            parsed.responseJson = JSON.parse(parsed.responseText) as unknown as Res;
        } catch (error) {
            return parsed.responseText || response.statusText;
        }

        return parsed.responseJson as unknown as Res;
    };

    public static head<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.HEAD });
    }

    public static get<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.GET });
    }

    public static post<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.POST });
    }

    public static put<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.PUT });
    }

    public static patch<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.PATCH });
    }

    public static delete<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.DELETE });
    }

    public static options<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.OPTIONS });
    }

    public static trace<TRequest extends Record<string | number, unknown>, TResponse>(req: HttpRequest<TRequest>) {
        return this.fetch<TRequest, TResponse>({ ...req, method: HttpMethods.TRACE });
    }

}

