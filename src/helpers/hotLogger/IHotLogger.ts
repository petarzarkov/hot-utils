/* eslint-disable @typescript-eslint/ban-types */
export type ErrorParams = { err: Error } & MessageParams;
export type MessageParams = Record<string, string | number | boolean | object | undefined>;
export type LoggerParams = Record<string, string | number | boolean | object | Error | undefined>;
export type TemplateTokens = (string | number | boolean | object)[];

export type HotLoggerMessage = (LoggerParams & {
    SourceContext: string;
    Message: string | LoggerParams;
    LogLevel: string;
    LogTimestamp: string;
    ExceptionMessage?: string;
    ExceptionStacktrace?: string;
})[];

export interface IHotLogger {
    trace(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    debug(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    info(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    warn(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    error(message: string, params: ErrorParams, ...templateTokens: TemplateTokens): void;
    fatal(message: string, params: ErrorParams, ...templateTokens: TemplateTokens): void;
}
