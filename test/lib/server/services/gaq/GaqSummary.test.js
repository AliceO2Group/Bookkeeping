/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { repositories: { GaqSummaryRepository } } = require('../../../../../lib/database');
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');
const { gaqDetectorService } = require('../../../../../lib/server/services/gaq/GaqDetectorsService.js');
const { updateRun } = require('../../../../../lib/server/services/run/updateRun.js');
const { gaqWorker } = require('../../../../../lib/server/services/gaq/GaqWorker.js');
const { gaqService } = require('../../../../../lib/server/services/gaq/GaqService.js');

/**
 * Wait for a given number of milliseconds
 * @param {number} ms milliseconds to wait
 * @return {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check whether an invalidation entry exists for a given data pass and run
 *
 * @param {number} expectedDataPassId
 * @param {number} expectedRunNumber
 * @param {boolean} toBeNull
 *
 * @return {Promise<void>}
 */
const expectInvalidation = async (expectedDataPassId, expectedRunNumber, toBeNull = false) => {
    const summary = await GaqSummaryRepository.findOne({
        where: { dataPassId: expectedDataPassId, runNumber: expectedRunNumber },
    });
    if (toBeNull) {
        expect(summary?.invalidatedAt, `Expected no invalidation for dataPassId=${expectedDataPassId} runNumber=${expectedRunNumber}`).to.be.null;
    } else {
        expect(summary?.invalidatedAt, `Expected invalidation for dataPassId=${expectedDataPassId} runNumber=${expectedRunNumber}`).to.not.be.null;
    }
};

module.exports = () => {
    before(async () => {
        await resetDatabaseContent();
    });

    const relations = { user: { roles: ['admin'], externalUserId: 1 } };
    const dataPassId = 4; // LHC22a_apass2
    const runNumber = 56;

    describe("GAQ Summary Invalidation", async () => {
        before(() => gaqWorker.pause());
        after(() => gaqWorker.resume());

        // Resetting the invalidated column between each case
        afterEach(async () => {
            await GaqSummaryRepository.updateAll({ invalidatedAt: null }, { where: {} });
        });

        it('should invalidate GAQ summary when a QC flag is created for a data pass', async () => {
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: 3 }],
                { runNumber, detectorIdentifier: { detectorId: 7 }, dataPassIdentifier: { id: dataPassId } },
                relations,
            );

            await expectInvalidation(dataPassId, runNumber);
        });

        it('should invalidate GAQ summary when a QC flag is verified for the first time for a data pass', async () => {
            const flagId = 8; // Seeded flag in data pass 4, run 100, with no verifications

            await qcFlagService.verifyFlag({ flagId }, relations);

            await expectInvalidation(dataPassId, 100);

            // Clear invalidation
            await GaqSummaryRepository.updateAll({ invalidatedAt: null }, { where: { dataPassId, runNumber: 100 } });

            // Verify again to check that no new invalidation is created when the flag is already verified
            await qcFlagService.verifyFlag({ flagId }, relations);
            await expectInvalidation(dataPassId, 100, true);
        });

        it('should invalidate GAQ summary when a QC flag is deleted for a data pass', async () => {
            const flagId = 9; // Seeded flag in data pass 4, run 105, with no verifications (so deletion is allowed)
            await qcFlagService.delete(flagId);

            await expectInvalidation(dataPassId, 105);
        });

        it('should invalidate GAQ summary for all runs when all QC flags are deleted for a data pass', async () => {
            await qcFlagService.deleteAllForDataPass(dataPassId);

            await expectInvalidation(dataPassId, 100);
        });

        it('should invalidate GAQ summary when GAQ detectors are explicitly set for a data pass and run', async () => {
            const gaqDataPassId = 3; // LHC22a_apass1 (has run 56 and detectors set up in GaqDetectorService tests)
            const detectorIds = [4, 7];

            await gaqDetectorService.setGaqDetectors(gaqDataPassId, [runNumber], detectorIds);

            await expectInvalidation(gaqDataPassId, runNumber);
        });

        it('should invalidate GAQ summary when default GAQ detectors are used for a data pass and run', async () => {
            const gaqDataPassId = 3;

            await gaqDetectorService.useDefaultGaqDetectors(gaqDataPassId, [runNumber]);

            await expectInvalidation(gaqDataPassId, runNumber);
        });

        it('should invalidate GAQ summary when the QC time of a run changes', async () => {
            await updateRun(
                { runNumber },
                { runPatch: { timeTrgStart: new Date('2019-08-08 20:30:00') } },
            );

            await expectInvalidation(dataPassId, runNumber);
        });
    });

    describe('GAQ Worker', () => {
        beforeEach(async () => {
            await resetDatabaseContent();
        });

        after(() => gaqWorker.pause());

        it('should process invalidations and update the summary', async () => {
            const workerDataPassId = 1;
            const workerRunNumber = 107;

            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: 3 }],
                { runNumber: workerRunNumber, detectorIdentifier: { detectorId: 1 }, dataPassIdentifier: { id: workerDataPassId } },
                relations,
            );

            // confirm that the invalidation is made
            await expectInvalidation(workerDataPassId, workerRunNumber);

            // wait at least 2s, recalculation period is 1s in test env, for the worker to process the invalidation
            await sleep(2000);

            await expectInvalidation(workerDataPassId, workerRunNumber, true);
            const summary = await GaqSummaryRepository.findOne({ where: { dataPassId: workerDataPassId, runNumber: workerRunNumber } });
            expect(summary.badRunCoverage).to.not.be.null;
        });

        it('should only upsert an existing summary row rather than creating a duplicate', async () => {
            const workerDataPassId = 1;
            const workerRunNumber = 107;

            await gaqService.calculateAndStoreGaqSummary(workerDataPassId, workerRunNumber);
            const firstSummary = await GaqSummaryRepository.findOne({ where: { dataPassId: workerDataPassId, runNumber: workerRunNumber } });
            expect(firstSummary).to.not.be.null;

            // Trigger an invalidation
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: 3 }],
                { runNumber: workerRunNumber, detectorIdentifier: { detectorId: 1 }, dataPassIdentifier: { id: workerDataPassId } },
                relations,
            );
            await expectInvalidation(workerDataPassId, workerRunNumber);

            await sleep(2000);

            await expectInvalidation(workerDataPassId, workerRunNumber, true);

            // confirm only one summary row exists (upsert, not duplicate)
            const summaries = await GaqSummaryRepository.findAll({ where: { dataPassId: workerDataPassId, runNumber: workerRunNumber } });
            expect(summaries).to.have.lengthOf(1);
        });

        it('should process multiple invalidations in a single batch', async () => {
            // Create invalidations for two different runs in data pass 1
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: 3 }],
                { runNumber: 106, detectorIdentifier: { detectorId: 1 }, dataPassIdentifier: { id: 1 } },
                relations,
            );
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: 3 }],
                { runNumber: 107, detectorIdentifier: { detectorId: 1 }, dataPassIdentifier: { id: 1 } },
                relations,
            );

            await expectInvalidation(1, 106);
            await expectInvalidation(1, 107);

            // Manually call the worker with batchSize=2 to process both in one go
            await gaqWorker.recalculateGaqSummaries(2);

            await expectInvalidation(1, 106, true);
            await expectInvalidation(1, 107, true);

            const summary106 = await GaqSummaryRepository.findOne({ where: { dataPassId: 1, runNumber: 106 } });
            const summary107 = await GaqSummaryRepository.findOne({ where: { dataPassId: 1, runNumber: 107 } });
            expect(summary106).to.not.be.null;
            expect(summary107).to.not.be.null;
        });

        it('should skip processing if a previous call is still in progress', async () => {
            // Stub gaqService to be slow so the first call blocks
            let resolveFirst;
            const slowPromise = new Promise((resolve) => { resolveFirst = resolve; });
            const stub = sinon.stub(gaqService, 'popNInvalidSummaryAndRecalculate').returns(slowPromise);

            try {
                // First call — will be held open by the slow stub
                const firstCall = gaqWorker.recalculateGaqSummaries(1);

                // Second call — should be skipped because _isSynchronizing is true
                await gaqWorker.recalculateGaqSummaries(1);

                // Stub should only have been called once
                expect(stub.callCount).to.equal(1);

                // Release the first call
                resolveFirst();
                await firstCall;
            } finally {
                sinon.restore();
            }
        });

    });
};
