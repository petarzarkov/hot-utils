import { HttpMethods } from "./HttpMethods";
import { RequestInit } from "node-fetch";

export type ParamsType = Record<string, string | boolean | number | undefined>;

export interface IBaseOptions extends RequestInit {
    customHeaders?: Record<string, string>;
    timeout?: number;
    path?: string;
    pathParams?: ParamsType;
    queryParams?: ParamsType;
}

export type HttpRequest<TRequest extends Record<string | number, unknown>> = {
    url: string;
    method: `${HttpMethods}`;
    payload?: TRequest;
    options?: IBaseOptions;
};
