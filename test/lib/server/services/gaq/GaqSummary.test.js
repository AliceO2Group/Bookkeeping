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
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { repositories: { GaqSummaryRepository } } = require('../../../../../lib/database');
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');
const { gaqDetectorService } = require('../../../../../lib/server/services/gaq/GaqDetectorsService.js');
const { updateRun } = require('../../../../../lib/server/services/run/updateRun.js');

module.exports = () => {
    before(async () => {
        await resetDatabaseContent();
    });

    const relations = { user: { roles: ['admin'], externalUserId: 1 } };
    const dataPassId = 4; // LHC22a_apass2
    const runNumber = 56;

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

    describe("GAQ Summary Invalidation", async () => {
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
            await expectInvalidation(dataPassId, 105);
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
};
