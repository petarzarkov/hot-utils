/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { HotLogLevel, HotLogDisplayName } from "./HotLogLevel";
import { IHotLogger, MessageParams, ErrorParams, LoggerParams, HotLoggerMessage } from "./IHotLogger";
import { NODE_ENV, LOG_LEVEL, APP_NAME, VERSION } from "../../constants";

export class HotLogger implements IHotLogger {
    private readonly levelMap: Record<HotLogLevel, HotLogDisplayName>;
    public readonly configuredLogLevel: HotLogLevel;
    public readonly name: string;
    public readonly staticLogParams: LoggerParams;
    public constructor(name: string) {
        this.name = name;
        this.configuredLogLevel = LOG_LEVEL && this.isValidLogLevel(LOG_LEVEL) ? HotLogLevel[<keyof typeof HotLogLevel>LOG_LEVEL] : HotLogLevel.TRACE;
        this.levelMap = {
            [HotLogLevel.TRACE]: HotLogDisplayName.Trace,
            [HotLogLevel.DEBUG]: HotLogDisplayName.Debug,
            [HotLogLevel.INFO]: HotLogDisplayName.Information,
            [HotLogLevel.WARN]: HotLogDisplayName.Warning,
            [HotLogLevel.ERROR]: HotLogDisplayName.Error,
            [HotLogLevel.FATAL]: HotLogDisplayName.Fatal,
            [HotLogLevel.OFF]: HotLogDisplayName.Off
        };
        this.staticLogParams = {
            ProcessID: process.pid,
            AppVersion: VERSION || "missing",
            AppName: APP_NAME || "missing",
            Env: NODE_ENV
        };
    }

    public static createLogger(name: string) {
        return new HotLogger(name);
    }

    public isValidLogLevel = (level: string) => Object.keys(HotLogLevel).includes(level);

    private log(level: HotLogLevel, message: string, params: MessageParams = {}) {
        if (this.configuredLogLevel <= level) {
            const loggerMessage = this.parseLogMessage(level, message, params);
            console.log(JSON.stringify(loggerMessage));
        }
    }

    public trace(message: string, params: MessageParams = {}) {
        return this.log(HotLogLevel.TRACE, message, params);
    }
    public debug(message: string, params: MessageParams = {}) {
        return this.log(HotLogLevel.DEBUG, message, params);
    }
    public info(message: string, params: MessageParams = {}) {
        return this.log(HotLogLevel.INFO, message, params);
    }
    public warn(message: string, params: MessageParams = {}) {
        return this.log(HotLogLevel.WARN, message, params);
    }
    public error(message: string, params: ErrorParams) {
        return this.log(HotLogLevel.ERROR, message, params);
    }
    public fatal(message: string, params: ErrorParams) {
        return this.log(HotLogLevel.FATAL, message, params);
    }

    public parseLogMessage(level: HotLogLevel, message: string, params: LoggerParams): HotLoggerMessage | undefined {
        let v: string | LoggerParams = message;
        if (typeof message === "object") {
            v = params;
            params = message;
        }

        let err: string | undefined;
        let stack: string | undefined;
        if (params.err instanceof Error) {
            if (!params.err.stack) Error.captureStackTrace(params.err);
            err = params.err.message;
            stack = params.err.stack;
        } else if (params.err && typeof params.err !== "string") {
            err = JSON.stringify(params.err);
        } else if (typeof params.err === "string") {
            const errFromString = new Error(params.err);
            if (!errFromString.stack) Error.captureStackTrace(errFromString);
            err = params.err;
            stack = errFromString.stack;
        }

        return [{
            Message: v,
            LogLevel: this.levelMap[level],
            SourceContext: this.name,
            ...err && { ExceptionMessage: err, ...stack && { ExceptionStacktrace: stack.split("\n")[1].trim() } },
            ...params.err ? { ...params, err: undefined } : { ...params },
            ...this.staticLogParams,
            LogTimestamp: new Date().toISOString()
        }];
    }

}
