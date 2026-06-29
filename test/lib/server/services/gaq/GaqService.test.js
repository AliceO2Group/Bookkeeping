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
const { repositories: { GaqSummaryRepository} } = require('../../../../../lib/database');
const { gaqService } = require('../../../../../lib/server/services/gaq/GaqService.js');
const { gaqWorker } = require('../../../../../lib/server/services/gaq/GaqWorker.js');
const { Op } = require('sequelize');

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
    GaqSummaryRepository.upsert({ dataPassId, runNumber, invalidatedAt: new Date(createdAt) });

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

        it('should store a summary with notComputable set to true when there is no coverage data for the run', async () => {
            // Run 49 has no QC flags seeded for data pass 1
            await gaqService.calculateAndStoreGaqSummary(dataPassId, 49);

            const summary = await findSummary(dataPassId, 49);
            expect(summary).to.not.be.null;
            expect(summary.notComputable).to.be.true;

            await GaqSummaryRepository.removeAll({ where: { dataPassId, runNumber: 49 } });
        });

        it('should clear stale coverage fields when a previously-computable row becomes notComputable', async () => {
            // Seed a row that has values but will become notComputable after recalculation due to missing QC flags
            const staleRunNumber = 49;
            await GaqSummaryRepository.upsert({
                dataPassId,
                runNumber: staleRunNumber,
                badRunCoverage: 0.5,
                explicitlyNotBadRunCoverage: 0.4,
                mcReproducibleCoverage: 0.1,
                missingVerificationsCount: 2,
                undefinedQualityPeriodsCount: 1,
                notComputable: false,
            });

            // Run 49 has no QC flags seeded for data pass 1, so _computeSummary returns null
            await gaqService.calculateAndStoreGaqSummary(dataPassId, staleRunNumber);

            const summary = await findSummary(dataPassId, staleRunNumber);
            expect(summary).to.not.be.null;
            expect(summary.notComputable).to.be.true;
            expect(summary.badRunCoverage).to.be.null;
            expect(summary.explicitlyNotBadRunCoverage).to.be.null;
            expect(summary.mcReproducibleCoverage).to.be.null;
            expect(summary.missingVerificationsCount).to.be.null;
            expect(summary.undefinedQualityPeriodsCount).to.be.null;

            await GaqSummaryRepository.removeAll({ where: { dataPassId, runNumber: staleRunNumber } });
        });

        it('should not clear invalidatedAt if the row was re-invalidated during compute', async () => {
            // Seed an initial invalidation so the row has a known invalidatedAt
            await GaqSummaryRepository.invalidate(dataPassId, runNumber);
            const initial = await findSummary(dataPassId, runNumber);
            expect(initial.invalidatedAt).to.not.be.null;

            // Simulate a concurrent invalidate by mocking _computeSummary to invalidate the row again but still return a valid summary
            sinon.stub(gaqService, '_computeSummary').callsFake(async () => {
                await GaqSummaryRepository.invalidate(dataPassId, runNumber);
                return {
                    badRunCoverage: 0,
                    explicitlyNotBadRunCoverage: 1,
                    mcReproducibleCoverage: 0,
                    missingVerificationsCount: 0,
                    undefinedQualityPeriodsCount: 0,
                };
            });

            try {
                await gaqService.calculateAndStoreGaqSummary(
                    dataPassId,
                    runNumber,
                    { expectedInvalidatedAt: initial.invalidatedAt },
                );
            } finally {
                sinon.restore();
            }

            const after = await findSummary(dataPassId, runNumber);
            // InvalidatedAt should not have been cleared because the row was re-invalidated during compute
            expect(after.invalidatedAt).to.not.be.null;
            expect(after.invalidatedAt).to.be.greaterThan(initial.invalidatedAt);
        });
    });

    describe('getSummary', () => {
        before(() => gaqWorker.pause());
        after(() => gaqWorker.resume());

        afterEach(async () => {
            await GaqSummaryRepository.removeAll({ where: { dataPassId } });
        });

        it('should return the summary for a single run when runNumber is given', async () => {
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);

            const result = await gaqService.getSummary(dataPassId, { runNumber });
            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(
                'badEffectiveRunCoverage',
                'explicitlyNotBadEffectiveRunCoverage',
                'invalidatedAt',
                'mcReproducible',
                'missingVerificationsCount',
                'notComputable',
                'undefinedQualityPeriodsCount',
            );
            expect(result.missingVerificationsCount).to.equal(3);
            expect(result.mcReproducible).to.be.true;
        });

        it('should return null when runNumber is given and no row exists', async () => {
            const result = await gaqService.getSummary(dataPassId, { runNumber: 999999 });
            expect(result).to.be.null;
        });

        it('should return a summary with null coverage fields when the row is notComputable', async () => {
            // Run 49 has no QC flags in data pass 1, so calculateAndStoreGaqSummary writes a notComputable row
            await gaqService.calculateAndStoreGaqSummary(dataPassId, 49);

            const result = await gaqService.getSummary(dataPassId, { runNumber: 49 });
            expect(result).to.deep.equal({
                badEffectiveRunCoverage: null,
                explicitlyNotBadEffectiveRunCoverage: null,
                mcReproducible: false,
                missingVerificationsCount: null,
                undefinedQualityPeriodsCount: null,
                notComputable: true,
                invalidatedAt: result.invalidatedAt,
            });
        });

        it('should return a summary with null coverage fields when the row is invalidated but never computed', async () => {
            await GaqSummaryRepository.invalidate(dataPassId, runNumber);

            const result = await gaqService.getSummary(dataPassId, { runNumber });
            expect(result).to.deep.equal({
                badEffectiveRunCoverage: null,
                explicitlyNotBadEffectiveRunCoverage: null,
                mcReproducible: false,
                missingVerificationsCount: null,
                undefinedQualityPeriodsCount: null,
                notComputable: false,
                invalidatedAt: result.invalidatedAt,
            });
        });

        it('should include every existing row in the map, with null fields for those without coverage values', async () => {
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);
            await gaqService.calculateAndStoreGaqSummary(dataPassId, 49); // notComputable
            await GaqSummaryRepository.invalidate(dataPassId, 106); // invalidated, never computed

            const result = await gaqService.getSummary(dataPassId);
            expect(Object.keys(result).map(Number).sort()).to.deep.equal([49, 106, runNumber].sort());
            expect(result[runNumber].badEffectiveRunCoverage).to.not.be.null;
            expect(result[49].badEffectiveRunCoverage).to.be.null;
            expect(result[106].badEffectiveRunCoverage).to.be.null;
        });

        it('should return the previously-computed values for a row that has been invalidated but not yet recomputed', async () => {
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);
            const expected = await gaqService.getSummary(dataPassId, { runNumber });

            await GaqSummaryRepository.invalidate(dataPassId, runNumber);

            const result = await gaqService.getSummary(dataPassId, { runNumber });
            expect(result).to.deep.equal({ ...expected, invalidatedAt: result.invalidatedAt });
            expect(result.invalidatedAt).to.not.be.null;
        });

        it('should not leak rows from other data passes into the result', async () => {
            const otherDataPassId = 2;
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);
            await GaqSummaryRepository.upsert({
                dataPassId: otherDataPassId,
                runNumber,
                badRunCoverage: 0.5,
                explicitlyNotBadRunCoverage: 0.5,
                mcReproducibleCoverage: 0,
                missingVerificationsCount: 0,
                undefinedQualityPeriodsCount: 0,
                notComputable: false,
            });

            try {
                const result = await gaqService.getSummary(dataPassId);
                expect(Object.keys(result).map(Number)).to.have.members([runNumber]);
            } finally {
                await GaqSummaryRepository.removeAll({ where: { dataPassId: otherDataPassId, runNumber } });
            }
        });

        it('should return an empty map when no summary rows exist for the data pass', async () => {
            const result = await gaqService.getSummary(dataPassId);
            expect(result).to.deep.equal({});
        });

        it('should treat mcReproducible coverage as not-bad when mcReproducibleAsNotBad is true', async () => {
            await gaqService.calculateAndStoreGaqSummary(dataPassId, runNumber);

            const defaultResult = await gaqService.getSummary(dataPassId, { runNumber });
            const asNotBadResult = await gaqService.getSummary(dataPassId, { runNumber, mcReproducibleAsNotBad: true });

            expect(asNotBadResult.badEffectiveRunCoverage).to.be.lessThan(defaultResult.badEffectiveRunCoverage + 1e-9);
            expect(asNotBadResult.explicitlyNotBadEffectiveRunCoverage)
                .to.be.greaterThan(defaultResult.explicitlyNotBadEffectiveRunCoverage - 1e-9);
            const defaultTotal = defaultResult.badEffectiveRunCoverage + defaultResult.explicitlyNotBadEffectiveRunCoverage;
            const asNotBadTotal = asNotBadResult.badEffectiveRunCoverage + asNotBadResult.explicitlyNotBadEffectiveRunCoverage;
            expect(asNotBadTotal).to.be.closeTo(defaultTotal, 1e-9);
        });
    });

    describe('popNInvalidSummaryAndRecalculate', () => {
        beforeEach(async () => {
            await GaqSummaryRepository.updateAll({ invalidatedAt: null }, { where: {} });
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

            const remaining = await GaqSummaryRepository.findOne({ where: { dataPassId, runNumber: 107, invalidatedAt: { [Op.not]: null } } });
            expect(remaining).to.not.be.null;
        });

        it('should process all invalidations when batchSize covers them all', async () => {
            await insertInvalidation(dataPassId, 106, '2024-01-01 10:00:00');
            await insertInvalidation(dataPassId, 107, '2024-01-01 11:00:00');

            await gaqService.popNInvalidSummaryAndRecalculate(10);

            const count = await GaqSummaryRepository.count({ where: { dataPassId, invalidatedAt: { [Op.not]: null } } });
            expect(count).to.equal(0);
        });
    });
};
