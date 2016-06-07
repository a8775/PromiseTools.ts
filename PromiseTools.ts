/**
 * Promise tools, impelmentaion of few typical use cases of Promises.
 * 
 * @export
 * @class PromiseTools
 */
export class PromiseTools {
    /**
     * Delay/sleep method based on promise.
     * 
     * @static
     * @param {number} msec (description)
     * @returns {Promise<void>} (description)
     */
    public static delay(msec: number): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            setTimeout(resolve, msec);
        });
    }

    public static loop(msec: number, fn: { (): Promise<any> }): Promise<void> {
        return Promise.reject('not implemented!');
    }

    private static _sequence(fn: { (idx: number, results: any[]): Promise<any> }, num: number, idx: number, results: any[]): Promise<any> {
        if (idx == num)
            return Promise.resolve(results);
        if (idx > num)
            return Promise.reject(`PromiseTools._sequence() - index out of range: num=${num}, idx=${idx}`);

        return fn(idx, results)
            .then((res) => {
                results.push(res);
                return PromiseTools._sequence(fn, num, idx + 1, results);
            });
    }

    public static sequence(fn: { (nth: number): Promise<any> }, num: number): Promise<any[]> {
        var results: any[] = [];
        return PromiseTools._sequence(fn, num, 0, results)
            .then(() => {
                return Promise.resolve(results);
            });
    }


    /**
     * Execute every promise in 'parallel' (not exactly) and return array of results.
     * The difference to Promise.all() is that PromiseTools.every() wait until all 
     * promieses are resolved or rejected (Promise.all() wait until all promises 
     * are resolved or one is rejected).
     * 
     * @static
     * @param {Promise<any>[]} pArray (description)
     * @returns {Promise<{ resolved: any; rejected: any; }[]>} (description)
     */
    public static every(pArray: Promise<any>[]): Promise<{ resolved: any; rejected: any; }[]> {
        var results = [];
        var ready = Promise.resolve<any>(null);

        pArray.forEach((promise) => {
            ready = ready
                .then(() => {
                    return promise;
                })
                .then((value) => {
                    results.push({ resolved: value, rejected: undefined });
                })
                .catch((err) => {
                    results.push({ resolved: undefined, rejected: err });
                });
        });

        return ready
            .then(() => {
                return Promise.resolve<{ resolved: any; rejected: any; }[]>(results);
            });
    }
}

