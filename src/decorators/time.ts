import { HotWatch } from "../helpers";

type TimeOptions<I> = {
    /**
     * @param timeStart starting ms
     * @param timeEnd ending ms
     */
    handler: (timeStart: number, timeEnd: number, instance: I) => unknown;
};

/**
 * Catches error
 * @param [opts] - provide only one of the options
 * @param handler - optional handler
 * @param defaultValue - optional default value to return on catching an error if no handler is specified, default null
 * @returns defaultValue or return value of handler
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function time<ClassInstance extends Object>(opts: TimeOptions<ClassInstance>) {

    return <Class extends ClassInstance, Method extends (...args: never) => (Promise<unknown> | unknown)>(
        target: Class,
        key: keyof Class,
        descriptor: TypedPropertyDescriptor<Method>
    ) => {
        const method = descriptor.value;
        if (typeof method !== "function") {
            throw new TypeError(`@time can only be used on methods, not on: ${typeof method}, at: ${target.constructor.name}.${key?.toString()}`);
        }

        descriptor.value = function (this: typeof target, ...args) {
            const sw = new HotWatch();
            try {
                return method.apply(this, args);
            } finally {
                opts.handler(sw.startTime, sw.getElapsedMs(), this);
            }
        } as Method;

        return descriptor;
    };
}