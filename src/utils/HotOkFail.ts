export interface IOkResult<T> {
    isOk: true;
    result: T | undefined;
}

export interface IFailResult<ErrorType = Error | unknown> {
    isOk: false;
    error: ErrorType;
}

export const ok = <T>(data: T | undefined): IOkResult<T> => ({ isOk: true, result: data });
export const fail = (error: Error | unknown): IFailResult => ({ isOk: false, error });