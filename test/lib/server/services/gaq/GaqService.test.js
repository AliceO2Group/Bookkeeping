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
const { repositories: { GaqSummaryRepository, GaqSummaryInvalidationRepository } } = require('../../../../../lib/database');
const { gaqService } = require('../../../../../lib/server/services/gaq/GaqService.js');

/**
 * Find the GAQ summary row for a given data pass and run
 * @param {number} dataPassId data pass id
 * @param {number} runNumber run number
 * @return {Promise<object|null>}
 */
const findSummary = (dataPassId, runNumber) => GaqSummaryRepository.findOne({ where: { dataPassId, runNumber } });

/**
 * Insert an invalidation entry
 * @param {number} dataPassId data pass id
 * @param {number} runNumber run number
 * @param {string} createdAt ISO timestamp string
 * @return {Promise<void>}
 */
const insertInvalidation = (dataPassId, runNumber, createdAt) =>
    GaqSummaryInvalidationRepository.insert({ dataPassId, runNumber, createdAt: new Date(createdAt) });

// Tests for GaqService are split between QcFlagService.test.js and GaqSummary.test.js
// GaqService.test.js (this file) focuses on the summary recalculation and invalidation processing logic

module.exports = () => {
    before(resetDatabaseContent);

    // Data pass 1 (LHC22b_apass1), run 107 has GAQ detectors CPV (1) and ACO (2) seeded
    // and has seeded QC flags, so a summary can always be computed
    const dataPassId = 1;
    const runNumber = 107;

    describe('calculateAndStoreGaqSummary', () => {
        afterEach(async () => {
            await GaqSummaryRepository.removeAll({ where: { dataPassId, runNumber } });
        });

        it('should compute and store a summary row with correct values', async () => {
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);

            const summary = await findSummary(dataPassId, runNumber);
            expect(summary).to.not.be.null;
            expect(summary.dataPassId).to.equal(dataPassId);
            expect(summary.runNumber).to.equal(runNumber);
            expect(summary.badRunCoverage).to.equal(0);
            expect(summary.explicitlyNotBadRunCoverage).to.equal(0.759654);
            expect(summary.mcReproducibleCoverage).to.equal(0.240346);
            expect(summary.missingVerificationsCount).to.equal(3);
            expect(summary.undefinedQualityPeriodsCount).to.equal(0);
        });

        it('should upsert when a summary already exists', async () => {
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);

            const rows = await GaqSummaryRepository.findAll({ where: { dataPassId, runNumber } });
            expect(rows).to.have.lengthOf(1);
        });

        it('should not store a summary when there is no coverage data for the run', async () => {
            // Run 49 has no QC flags seeded for data pass 1
            await gaqService.calculateAndStoreGaqSummary(dataPassId, 49);

            const summary = await findSummary(dataPassId, 49);
            expect(summary).to.be.null;
        });
    });

    describe('popNInvalidSummaryAndRecalculate', () => {
        beforeEach(async () => {
            await GaqSummaryInvalidationRepository.removeAll({ truncate: true });
        });

        it('should do nothing when the invalidation table is empty', async () => {
            await gaqService.popNInvalidSummaryAndRecalculate(5);
            // No error thrown and nothing written
            const summary = await findSummary(dataPassId, runNumber);
            expect(summary).to.be.null;
        });

        it('should process exactly N invalidations ordered by createdAt', async () => {
            // Insert invalidations for runs 106 and 107 in data pass 1 with different timestamps
            await insertInvalidation(dataPassId, 106, '2024-01-01 10:00:00');
            await insertInvalidation(dataPassId, 107, '2024-01-01 11:00:00');

            // Process only 1 — should pick run 106 (oldest)
            await gaqService.popNInvalidSummaryAndRecalculate(1);

            const remaining = await GaqSummaryInvalidationRepository.findOne({ where: { dataPassId, runNumber: 107 } });
            expect(remaining).to.not.be.null;
        });

        it('should process all invalidations when batchSize covers them all', async () => {
            await insertInvalidation(dataPassId, 106, '2024-01-01 10:00:00');
            await insertInvalidation(dataPassId, 107, '2024-01-01 11:00:00');

            await gaqService.popNInvalidSummaryAndRecalculate(10);

            const count = await GaqSummaryInvalidationRepository.count({ where: { dataPassId } });
            expect(count).to.equal(0);
        });
    });
};
