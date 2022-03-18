export class HotPromise extends Promise<unknown> {
    public static delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    /**
     * Returns a Promise that is resolved or rejected when the provided Promise does not resolve in time.
     * @param {Promise} promise
     * @param {number} ms
     * @param {Error} timeoutError
     * @returns A new Promise.
     */
    public static promiseTimeout = <RType>(promise: Promise<RType>, ms: number, timeoutError?: Error) => {
        const timeout = new Promise<never>((_, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(timeoutError || new Error(`Timed out in ${ms} ms.`));
            }, ms);
        });

        return Promise.race<RType>([promise, timeout]);
    };

    /**
     * @param action - Function that returns a Promise that resolves to { isGood: boolean; result: R }
     * @param retryTimes - Default retry times are 5, you can pass in "forever" to retry indefinitely,
     * retries will stop as soon as isGood: true has been returned by the retried action
     * @param interval - default is 500 ms
     * @returns
     */
    public static runTillSuccess<R>(action: () => Promise<{ isGood: boolean; result: R }>, retryTimes: number | "forever" = 5, interval = 500): Promise<R> {
        return new Promise((resolve, reject) => {
            const counter = { count: 0 };
            const waitTillIsGood = async () => {
                counter.count += 1;
                if (counter.count === retryTimes) {
                    return reject(new Error(`Fail, total tries: ${retryTimes}`));
                }

                try {
                    const act = await action();
                    if (act.isGood) {
                        return resolve(act.result);
                    }

                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    setTimeout(waitTillIsGood, interval);
                } catch (error) {
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    setTimeout(waitTillIsGood, interval);
                }
            };

            void waitTillIsGood();
        });
    }
}
