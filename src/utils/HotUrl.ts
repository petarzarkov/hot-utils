import { ParamsType } from "../contracts";

export class HotUrl {
    public static build({ base, path, queryParams, pathParams } : { base: string | URL; path?: string; queryParams?: ParamsType; pathParams?: ParamsType }) {
        const urlString = (typeof base === "string") ? base : base.href;
        const baseUrlReplaced = this.replacePathParams(urlString, pathParams);
        const pathReplaced = path && this.replacePathParams(path, pathParams);
        const baseUrlFinal = this.buildFromString(baseUrlReplaced, pathReplaced);
        return this.buildQuery(baseUrlFinal, queryParams);
    }

    /**
     * Builds URL based on domain and query parameters
     * @param baseUrl Could end with / or not
     * @param queryParams Empty params will be filtered out
     * @returns https://www.yoururl.com/someString/api/v3/getSomething
     */
    public static buildQuery(baseUrl: string | URL, queryParams?: ParamsType): string {
        const url = (typeof baseUrl === "string") ? this.buildFromString(baseUrl) : baseUrl;

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
     * Replaces path params in URL
     * @param url www.yoururl.com/{somePathParam}/api/v3/getSomething
     * @param pathParams e.g. { somePathParam: "someString" } - Nullable param values will be ignored e.g. { somePathParam: undefined }
     * @returns www.yoururl.com/someString/api/v3/getSomething
     */
    public static replacePathParams(url: string, pathParams?: ParamsType): string {
        if (!pathParams) {
            return url;
        }

        let str = url;
        Object.keys(pathParams).forEach((item) => {
            const param = pathParams[item];
            if (param != null) {
                str = str.replace(new RegExp(`\\{${item}\\}`, "gi"), param.toString());
            }
        });

        return str;
    }

    /**
     * Returns URL
     * @param baseUrl Could end with / or not
     * @param path Could start with / or not
     */
    public static buildFromString(baseUrl: string, path?: string): URL {
        if (!baseUrl.endsWith("/") && path && baseUrl.split("?").length === 1) {
            baseUrl += "/";
        }

        if (path && path.startsWith("/")) {
            path = path.substr(1);
        }

        return path ? new URL(path, baseUrl) : new URL(baseUrl);
    }
}
