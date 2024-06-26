const { triggerCountersService } = require('../../../../../lib/server/services/triggerCounters/TriggerCountersService');
const { expect } = require('chai');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');

/**
 * Simplify a trigger counter to extract properties interesting in testing (remove createdAt and updatedAt)
 *
 * @param {TriggerCounters} counters the counters to simplify
 * @return {object} simplified trigger counters
 */
const simplifyTriggerCounters = ({
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
}) => ({ id, runNumber, className, timestamp, lmb, lma, l0b, l0a, l1b, l1a });

module.exports = () => {
    after(resetDatabaseContent);

    it('Should successfully return the list of trigger counters for a given run', async () => {
        expect((await triggerCountersService.getPerRun(1)).map(simplifyTriggerCounters)).to.deep.eql([
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

    it('Should successfully insert new counters for a given run', async () => {
        const now = new Date();
        const counters = {
            timestamp: Math.floor(now.getTime() / 1000) * 1000,
            lmb: 1,
            lma: 2,
            l0b: 3,
            l0a: 4,
            l1b: 5,
            l1a: 6,
        };
        await triggerCountersService.createOrUpdatePerRun(
            {
                runNumber: 2,
                className: 'CLASS-NAME',
            },
            counters,
        );
        expect((await triggerCountersService.getPerRun(2)).map(simplifyTriggerCounters)).to.deep.eql([
            {
                id: 3,
                runNumber: 2,
                className: 'CLASS-NAME',
                ...counters,
            },
        ]);
    });

    it('Should successfully update existing counters for a given run', async () => {
        const now = new Date();
        const counters = {
            timestamp: Math.floor(now.getTime() / 1000) * 1000,
            lmb: 11,
            lma: 12,
            l0b: 13,
            l0a: 14,
            l1b: 15,
            l1a: 16,
        };
        await triggerCountersService.createOrUpdatePerRun(
            {
                runNumber: 2,
                className: 'CLASS-NAME',
            },
            counters,
        );
        expect((await triggerCountersService.getPerRun(2)).map(simplifyTriggerCounters)).to.deep.eql([
            {
                id: 3,
                runNumber: 2,
                className: 'CLASS-NAME',
                ...counters,
            },
        ]);
    });

    it('Should throw when trying to create/update counters for a non-existing run', async () => {
        await assert.rejects(
            () => triggerCountersService.createOrUpdatePerRun(
                { runNumber: 999, className: 'CLASS-NAME' },
                { timestamp: 0, lmb: 0, lma: 0, l0b: 0, l0a: 0, l1b: 0, l1a: 0 },
            ),
            new BadParameterError('Run with this run number (999) could not be found'),
        );
    });
};
