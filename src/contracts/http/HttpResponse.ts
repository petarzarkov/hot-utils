import { ExpandRecursively } from "../utilities";

export type HttpSuccessResponse<T> = {
    success: true;
    status: number;
    elapsed: number;
    result: T;
};

export type HttpErrorResponse<T> = {
    success: false;
    error: string;
    stack?: string;
    elapsed: number;
    status: number;
    result?: T;
};

export type HttpResponse<T> = ExpandRecursively<HttpSuccessResponse<T> | HttpErrorResponse<T>>;
