import { HotWatch } from "../helpers";

type TimeOptions<I> = {
    /**
     * @param timeStart starting ms
     * @param timeEnd ending ms
     */
    handler: (timeStart: number, timeEnd: number, instance: I) => unknown;
};

/**
 * Times method
 * @param opts.handler - handler accepting starting and ending time
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