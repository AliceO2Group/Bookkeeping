const { triggerCountersService } = require('../../../../../lib/server/services/triggerCounters/TriggerCountersService');
const { expect } = require('chai');

module.exports = () => {
    it('Should successfully return the list of trigger counters for a given run', async () => {
        expect((await triggerCountersService.getPerRun(1)).map(({
            id,
            runNumber,
            className,
            timestamp,
            lmb,
            lma,
            l0b,
            l0a,
            l1b,
            l1a,
        }) => ({ id, runNumber, className, timestamp, lmb, lma, l0b, l0a, l1b, l1a })))
            .to.deep.eql([
                {
                    id: 1,
                    runNumber: 1,
                    timestamp: new Date('2024-06-03 14:45:12').getTime(),
                    className: 'FIRST-CLASS-NAME',
                    lmb: 101,
                    lma: 102,
                    l0b: 103,
                    l0a: 104,
                    l1b: 105,
                    l1a: 106,
                },
                {
                    id: 2,
                    runNumber: 1,
                    timestamp: new Date('2024-06-03 14:45:12').getTime(),
                    className: 'SECOND-CLASS-NAME',
                    lmb: 2001,
                    lma: 2002,
                    l0b: 2003,
                    l0a: 2004,
                    l1b: 2005,
                    l1a: 2006,
                },
            ]);
        expect(await triggerCountersService.getPerRun(2)).to.eql([]);
    });
};
