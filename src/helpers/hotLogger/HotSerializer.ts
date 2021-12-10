import { IHotLogSerializer, IHotModifier, SerializeParams } from "./IHotLogger";

export abstract class HotSerializer {
    private readonly _logSerializers: IHotLogSerializer[] | undefined;

    constructor(logSerializers: IHotLogSerializer[] | undefined) {
        this._logSerializers = logSerializers;
    }

    protected serializeParams(params?: SerializeParams) {
        if (!this._logSerializers || !params) return params;

        const paramsCopy = JSON.parse(JSON.stringify(params)) as SerializeParams;

        this._logSerializers.forEach((serializer: IHotLogSerializer) => {
            const paramValue = paramsCopy[serializer.key]?.toString();
            if (paramValue && serializer.values?.includes(paramValue)) {
                serializer.modifiers?.forEach((modifier: IHotModifier) => {
                    modifier.properties?.forEach((prop: string) => {
                        const { array, regex } = modifier;
                        this.objectMatchesSerializer(paramsCopy, prop, array, regex);
                    });
                });
            }
        });

        return paramsCopy;
    }

    protected objectMatchesSerializer(params: Record<string, unknown>, prop: string, array?: string[], regex?: string) {
        const keys = prop.split(".");
        while (keys.length > 1) {
            params = params[<string>keys.shift()] as Record<string, unknown>;
            // If params is not an object we have an incorrect configuration
            if (!params || typeof params !== "object") return;
        }

        const key = keys.shift() as string;
        const value = params[key];
        if (value == null) return;

        if (array && Array.isArray(value)) {
            // It doesn't support deep search in the array objects
            const mapFn = array.length ? (v: Record<string, unknown>) => {
                array.forEach(p => {
                    if (v[p] != null) v[p] = this.getMaskedValue(v[p], regex);
                });

                return v;
            } : (v: Record<string, unknown> | string) => this.getMaskedValue(v, regex);

            params[key] = value.map((v: Record<string, unknown>) => v != null ? mapFn(v) : v);
            return;
        }

        params[key] = this.getMaskedValue(value, regex);
    }

    protected getMaskedValue(value: Record<string, unknown> | string | unknown, regex?: string) {
        return typeof value === "string" && regex ?
            value.replace(new RegExp(regex, "g"), (_match: string, p1: string, _p2: string, p3: string) => `${p1}${this.maskSecret()}${p3}`)
            : this.maskSecret();
    }

    protected maskSecret(): string {
        return "********";
    }
}