export class PromiseResult {
    public resolved: any;
    public rejected: any;
}

export class PromiseTools {
    public static delay(msec: number): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            setTimeout(resolve, msec);
        });
    }

    private static _sequence(fnArray: { (arg: any): Promise<any>; }[], idx: number, results: any[]): Promise<any> {
        if (idx >= fnArray.length)
            return Promise.resolve();

        return fnArray[idx](idx > 0 ? results[idx - 1] : undefined)
            .then((res) => {
                results[idx] = res;
                return PromiseTools._sequence(fnArray, idx + 1, results);
            });
    }

    public static sequence(fnArray: { (arg: any): Promise<any>; }[]): Promise<any[]> {
        var results: any[] = new Array(fnArray.length);
        return PromiseTools._sequence(fnArray, 0, results)
            .then(() => {
                return Promise.resolve(results);
            });
    }

    public static every(pArray: Promise<any>[]): Promise<PromiseResult[]> {
        var results = [];
        var ready = Promise.resolve<any>(null);

        pArray.forEach((promise) => {
            ready = ready
                .then(() => {
                    return promise;
                })
                .then((value) => {
                    results.push({resolved: value, rejected: undefined});
                })
                .catch((err) => {
                    results.push({resolved: undefined, rejected: err});
                });
        });

        return ready
            .then(() => {
                return Promise.resolve<PromiseResult[]>(results);
            });
    }
}

