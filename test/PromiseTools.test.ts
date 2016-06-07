import assert = require('assert');
import chai = require('chai');
var expect = chai.expect;

import {PromiseTools} from '../PromiseTools';

describe('PromiseTools.ts tests...', function () {
    it('One sec delay test, should be between 0.9-1.1 sec', function () {
        let start = (new Date()).valueOf();
        let end = null;

        return PromiseTools.delay(1000)
            .then(() => {
                end = (new Date()).valueOf();
            })
            .then(() => {
                return Promise.all([
                    expect(end - start).to.be.below(1100),
                    expect(end - start).to.be.above(900)
                ]);
            });
    });

    it('0.5 sec and 1 sec in sequence, should be between 1.4-1.6 sec', function () {
        let start = (new Date()).valueOf();
        let end = null;
        var fn = [
            (): Promise<void> => {
                return PromiseTools.delay(500)
            },
            (): Promise<void> => {
                return Promise.resolve();
            },
            (): Promise<void> => {
                return PromiseTools.delay(1000);
            }
        ];
        var idx = 0;

        return Promise.resolve()
            .then(() => {
                return PromiseTools.sequence((idx: number): Promise<void> => {
                    return fn[idx]();
                }, fn.length);
            })

            .then(() => {
                end = (new Date()).valueOf();
            })
            .then(() => {
                return Promise.all([
                    expect(end - start).to.be.below(1600),
                    expect(end - start).to.be.above(1400)
                ]);
            });
    });

    it('every: should resolve, reject, resolve, reject', function () {
        return PromiseTools.every([
            Promise.resolve("OK1"),
            Promise.reject("ERR2"),
            Promise.resolve("OK3"),
            Promise.reject("ERR4")])
            .then((value: { resolved: any; rejected: any; }[]) => {
                expect(value[0].rejected).to.be.undefined;
                expect(value[0].resolved).to.be.equal("OK1");
                expect(value[1].rejected).to.be.equal("ERR2");
                expect(value[1].resolved).to.be.undefined;
                expect(value[2].rejected).to.be.undefined;
                expect(value[2].resolved).to.be.equal("OK3");
                expect(value[3].rejected).to.be.equal("ERR4");
                expect(value[3].resolved).to.be.undefined;
            })
    });
});