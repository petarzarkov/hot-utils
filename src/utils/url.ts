import { ParamsType } from "../contracts";

/**
 * Replaces path params in URL
 * @param url www.yoururl.com/{somePathParam}/api/v3/getSomething
 * @param pathParams e.g. { somePathParam: "someString" }
 * @returns www.yoururl.com/someString/api/v3/getSomething
 */
export function replacePathParams(url: string, pathParams?: ParamsType): string {
    if (!pathParams) {
        return url;
    }

    let str = url;
    Object.keys(pathParams).forEach((item) => {
        const param = pathParams[item];
        if (param != null) {
            str = str.replace(new RegExp(`\\{${item}\\}`, "gi"), param.toString());
        } else {
            str = str.replace(new RegExp(`\\{${item}\\}`, "gi"), item);
        }
    });

    return str;
}

/**
 * Builds URL based on domain and query parameters
 * @param baseUrl Could end with / or not
 * @param queryParams Empty params will be filtered out
 * @returns https://www.yoururl.com/someString/api/v3/getSomething
 */
export function buildUrl(baseUrl: string | URL, queryParams?: ParamsType): string {
    const url = (typeof baseUrl === "string") ? makeURL(baseUrl) : baseUrl;

    if (queryParams) {
        Object.keys(queryParams)
            .forEach(key => {
                const value = queryParams[key];
                if (value != null) {
                    url.searchParams.set(key, value.toString());
                }
            });
    }

    return url.href;
}

/**
 * Returns URL
 * @param baseUrl Could end with / or not
 * @param path Could start with / or not
 */
function makeURL(baseUrl: string, path?: string): URL {
    if (!baseUrl.endsWith("/") && path && baseUrl.split("?").length === 1) {
        baseUrl += "/";
    }

    if (path && path.startsWith("/")) {
        path = path.substr(1);
    }

    return path ? new URL(path, baseUrl) : new URL(baseUrl);
}