import { HotLogLevel } from "./HotLogLevel";

export type ErrorParams = { err: Error } & MessageParams;
export type MessageParams = Record<string, string | number | boolean | object | undefined>;
export type LoggerParams = Record<string, string | number | boolean | object | Error | undefined>;
export type TemplateTokens = (string | number | boolean | object)[];
export type SerializeParams = LoggerParams | MessageParams;

export interface IHotLogConfig {
    level: keyof typeof HotLogLevel;
    filters?: IHotLogFilter[];
    serializers?: IHotLogSerializer[];
}

export type HotLoggerMessage = {
    Message: string | LoggerParams;
    LogLevel: string;
    Properties: LoggerParams;
    LogTimestamp: string;
    SourceContext: string;
    ExceptionMessage?: string;
    ExceptionStacktrace?: string;
};

export interface IHotLogger {
    trace(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    debug(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    info(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    warn(message: string, params?: MessageParams, ...templateTokens: TemplateTokens): void;
    error(message: string, params: ErrorParams, ...templateTokens: TemplateTokens): void;
    fatal(message: string, params: ErrorParams, ...templateTokens: TemplateTokens): void;

    child(logName: string): IHotLogger;
}

export interface IHotLogFilter {
    key: string;
    values: string[];
}

export interface IHotModifier {
    properties: string[];
    array?: string[];
    regex?: string;
}

export interface IHotLogSerializer {
    key: string;
    values: string[];
    modifiers: IHotModifier[];
}
