import { OneOrOther } from "../contracts/OneOrOther";

type TrapOptions<I> = OneOrOther<{
    /**
     * @param err instance of Error
     * @param instance instance of the callee Class
     */
    handler: (err: Error, instance: I) => unknown;
}, {
    /**
     * @default null
     */
    defaultValue: unknown;
}>;

/**
 * Catches error
 * @param [opts] - provide only one of the options
 * @param handler - optional handler
 * @param defaultValue - optional default value to return on catching an error if no handler is specified, default null
 * @returns defaultValue or return value of handler
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function trap<ClassInstance extends Object>(opts?: TrapOptions<ClassInstance>) {
    const defaultValue = opts && "defaultValue" in opts ? opts.defaultValue : null;
    const handler = opts && "handler" in opts ? opts.handler : undefined;

    return <Class extends ClassInstance, Method extends (...args: never) => (Promise<typeof defaultValue> | typeof defaultValue)>(
        target: Class,
        key: keyof Class,
        descriptor: TypedPropertyDescriptor<Method>
    ) => {
        const method = descriptor.value;
        if (typeof method !== "function") {
            throw new TypeError(`@trap can only be used on methods, not on: ${typeof method}, at: ${target.constructor.name}.${key?.toString()}`);
        }

        descriptor.value = function (this: typeof target, ...args) {
            try {
                if (!method) {
                    return defaultValue;
                }

                const result = method.apply(this, args);
                if (result && result instanceof Promise && typeof result.then === "function" && typeof result.catch === "function") {
                    return result.catch((error: Error) => {
                        if (handler) {
                            return handler(error, this);
                        }

                        return defaultValue;
                    });
                }

                return result;
            } catch (error) {
                if (handler) {
                    return handler(error as Error, this);
                }

                return defaultValue;
            }
        } as Method;

        return descriptor;
    };
}