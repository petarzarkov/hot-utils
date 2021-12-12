import { ExpandRecursively } from "../Expand";

export type HttpSuccessResponse<T> = {
    isGood: true;
    statusCode: number;
    elapsed: number;
    response: T;
};

export type HttpErrorResponse<T> = {
    isGood: false;
    error: string;
    elapsed: number;
    statusCode: number;
    response?: T;
};

export type HttpResponse<T> = ExpandRecursively<HttpSuccessResponse<T> | HttpErrorResponse<T>>;
