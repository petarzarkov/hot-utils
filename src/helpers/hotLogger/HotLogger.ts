import { HotSerializer } from "./HotSerializer";
import { HotLogLevel, HotLogDisplayName, LowerCaseLevel } from "./HotLogLevel";
import {
    IHotLogger, MessageParams, ErrorParams, LoggerParams, HotLoggerMessage,
    IHotLogConfig, IHotLogFilter, StaticParams
} from "./IHotLogger";
import { NODE_ENV, LOG_LEVEL, APP_NAME, VERSION, config } from "../../constants";

export class HotLogger extends HotSerializer implements IHotLogger {
    private readonly _levelMap: Record<HotLogLevel, HotLogDisplayName>;
    private _configuredLogLevel: HotLogLevel;
    private readonly _logConfig: IHotLogConfig | undefined;
    public readonly name: string;
    public readonly staticLogParams: StaticParams;
    public constructor(name: string, filters?: IHotLogFilter[]) {
        super(config?.has("log.serializers") ? config.get("log.serializers") : undefined);
        this.name = name;
        this._logConfig = config?.has("log") ? config.get<IHotLogConfig>("log") : {
            level: "TRACE",
            filters
        };
        if (filters && config?.has("log")) {
            this._logConfig.filters = this._logConfig.filters?.concat(filters);
        }

        this._configuredLogLevel = LOG_LEVEL && this.isValidLogLevel(LOG_LEVEL) ? HotLogLevel[<keyof typeof HotLogLevel>LOG_LEVEL] :
            this._logConfig?.level ? HotLogLevel[this._logConfig.level] : HotLogLevel.TRACE;
        this._levelMap = {
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
            AppName: APP_NAME,
            AppId: `${NODE_ENV}-${APP_NAME}`,
            Env: NODE_ENV
        };
    }

    public static createLogger(name: string, filters?: IHotLogFilter[]) {
        return new HotLogger(name, filters);
    }

    public isValidLogLevel = (level: string) => Object.keys(HotLogLevel).includes(level);

    private log(level: HotLogLevel, message: string, params: MessageParams = {}) {
        if (this._configuredLogLevel <= level && !this.filterMessage(message, params)) {
            const loggerMessage = this.parseLogMessage(this._levelMap[level], message, params);
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

    public child(childName: string): IHotLogger {
        if (!childName || typeof childName !== "string") {
            return this;
        }

        return new HotLogger(`${this.name}:${childName}`);
    }

    public parseLogMessage(level: HotLogDisplayName, message: string, params: LoggerParams): Record<string, unknown> | undefined {
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
            const errMsg = JSON.stringify(params.err);
            const newErr = new Error(errMsg);
            params.stack = newErr?.stack;
            params.err = newErr.message || errMsg;
        } else if (typeof params.err === "string") {
            const errFromString = new Error(params.err);
            if (!errFromString.stack) Error.captureStackTrace(errFromString);
            err = params.err;
            stack = errFromString.stack;
        }

        if (params.err) {
            delete params.err;
        }

        params = this.serializeParams(params) as LoggerParams;

        const parsedMessage: HotLoggerMessage = {
            Message: v,
            LogLevel: level,
            SourceContext: this.name,
            ...err && { ExceptionMessage: err, ...stack && { ExceptionStacktrace: stack.replace(/\n/g, "")?.split(/[\s]{2,}/)?.slice(1) } },
            Properties: Object.assign({}, this.staticLogParams, params),
            LogTimestamp: new Date().toISOString()
        };

        return parsedMessage;
    }

    private filterMessage(message: string | object, params: LoggerParams): boolean {
        if (!this._logConfig?.filters) {
            return false;
        }

        let paramsToFilter: LoggerParams = {};
        if (typeof message === "object") {
            paramsToFilter = <LoggerParams>Object.assign({}, message);
        }
        paramsToFilter = Object.assign({}, paramsToFilter, params);

        return this._logConfig.filters.some(filter => {
            return this.objectMatchesFilter(filter, paramsToFilter);
        });
    }

    private objectMatchesFilter(filter: IHotLogFilter, object: LoggerParams): boolean {
        const keys = filter.key.split(".");

        const objProp = object[keys[0]];
        if (objProp == null) {
            return false;
        }

        if (keys.length === 1) {
            return filter.values.some(val => {
                if (val.includes("/*") && typeof(objProp) === "string") {
                    return objProp.includes(val.replace("/*", ""));
                }

                return objProp === val;
            });
        }

        return this.objectMatchesFilter({ key: keys.slice(1).join("."), values: filter.values }, <LoggerParams>objProp);
    }

    public setLogLevel = (level: keyof typeof HotLogLevel | LowerCaseLevel) => {
        if (!this.isValidLogLevel(level)){
            return;
        }

        this._configuredLogLevel = HotLogLevel[level.toUpperCase() as keyof typeof HotLogLevel];
    };

    public getLogLevel = () => HotLogLevel[this._configuredLogLevel]?.toLowerCase() as LowerCaseLevel;
}