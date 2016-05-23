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

    /**
     * Private method to proceed squence.
     * 
     * @private
     * @static
     * @param {{ (arg: any): Promise<any>; }[]} fnArray (description)
     * @param {number} idx (description)
     * @param {any[]} (description)
     * @returns {Promise<any>} (description)
     */
    private static _sequence(fnArray: { (arg: any): Promise<any>; }[], idx: number, results: any[]): Promise<any> {
        if (idx >= fnArray.length)
            return Promise.resolve();

        return fnArray[idx](idx > 0 ? results[idx - 1] : undefined)
            .then((res) => {
                results.push(res);
                return PromiseTools._sequence(fnArray, idx + 1, results);
            });
    }

    /**
     * Exceute all functions in sequesnce. Every function have to return 
     * Promise<any> and result will be returned when all functions (promises)
     * are resolved or first is rejected.
     * 
     * TODO: when rejected there is no return information how many 
     * function was successfuly proceeded and its results.
     * 
     * @static
     * @param {{ (prevResult: any): Promise<any>; }[]} fnArray (description)
     * @returns {Promise<any[]>} (description)
     */
    public static sequence(fnArray: { (prevResult: any): Promise<any>; }[]): Promise<any[]> {
        var results: any[] = [];
        return PromiseTools._sequence(fnArray, 0, results)
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

