import { RequestInit } from "node-fetch";
import { IHotLogger } from "../../helpers";

export type ParamsType = Record<string, string | boolean | number | undefined>;

export interface IBaseOptions extends Partial<RequestInit> {
    headers?: Record<string, string>;
    timeout?: number;
    path?: string;
    pathParams?: ParamsType;
    queryParams?: ParamsType;
    requestId?: string;
    eventName?: string;
    logger?: IHotLogger | Console;
}

export type HttpRequest<TRequest extends Record<string | number, unknown>> = {
    url: string;
    payload?: TRequest;
    options?: IBaseOptions;
};
