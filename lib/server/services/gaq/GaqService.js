/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

/**
 * @typedef GaqFlags
 *
 * @property {number} from
 * @property {number} to
 * @property {QcFlag[]} contributingFlags
 */

/**
 * @typedef RunGaqSummary
 * @property {number} badEffectiveRunCoverage - fraction of run's data, which aggregated quality is bad
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, which aggregated quality is explicitly good
 * @property {number} missingVerificationsCount - number of not verified QC flags which are not discarded
 * @property {boolean} mcReproducible - states whether some aggregation of QC flags is Limited Acceptance MC Reproducible
 */

const { getOneDataPassOrFail } = require('../dataPasses/getOneDataPassOrFail.js');
const { QcFlagRepository, GaqSummaryRepository } = require('../../../database/repositories/index.js');
const { qcFlagAdapter } = require('../../../database/adapters/index.js');
const { Op } = require('sequelize');
const { QcSummarProperties } = require('../../../domain/enums/QcSummaryProperties.js');
const { LogManager } = require('@aliceo2/web-ui');

/**
 * Globally aggregated quality (QC flags aggregated for a predefined list of detectors per runs) service
 */
class GaqService {
    /**
     * Constructor
     */
    constructor() {
        this._logger = LogManager.getLogger('GAQ_SERVICE');
    }

    /**
     * Get GAQ summary
     *
     * @param {number} dataPassId id of data pass id
     * @param {object} [options] additional options
     * @param {boolean} [options.mcReproducibleAsNotBad = false] if set to true,
     * `Limited Acceptance MC Reproducible` flag type is treated as good one
     * @param {number} [options.runNumber] Optional run number to filter by
     * @return {Promise<GaqSummary>} Resolves with the GAQ Summary
     */
    async getSummary(dataPassId, { mcReproducibleAsNotBad = false, runNumber } = {}) {
        await getOneDataPassOrFail({ id: dataPassId });

        const where = { dataPassId };
        if (runNumber) {
            where.runNumber = runNumber;
        }

        const summaries = await GaqSummaryRepository.findAll({ where });
        const summaryByRun = Object.fromEntries(summaries.map((s) => [s.runNumber, this._formatSummary(s, mcReproducibleAsNotBad)]));

        return runNumber ? summaryByRun[runNumber] ?? {} : summaryByRun;
    }

    /**
     * Format a raw GAQ summary record into its API representation
     * @param {object} summary raw summary from the database
     * @param {boolean} mcReproducibleAsNotBad whether MC reproducible coverage counts as not-bad
     * @return {RunGaqSummary} formatted summary
     */
    _formatSummary(summary, mcReproducibleAsNotBad) {
        return {
            [QcSummarProperties.BAD_EFFECTIVE_RUN_COVERAGE]:
                summary.badRunCoverage + (mcReproducibleAsNotBad ? 0 : summary.mcReproducibleCoverage),
            [QcSummarProperties.EXPLICITELY_NOT_BAD_EFFECTIVE_RUN_COVERAGE]:
                summary.explicitlyNotBadRunCoverage + (mcReproducibleAsNotBad ? summary.mcReproducibleCoverage : 0),
            [QcSummarProperties.MC_REPRODUCIBLE]: summary.mcReproducibleCoverage > 0,
            [QcSummarProperties.MISSING_VERIFICATIONS]: summary.missingVerificationsCount,
            [QcSummarProperties.UNDEFINED_QUALITY_PERIODS_COUNT]: summary.undefinedQualityPeriodsCount,
        };
    }

    /**
     * Find GAQ summary for given data pass and run. Returns null if no summary can be computed (e.g. no QC flags in GAQ periods)
     * @param {number} dataPassId id of data pass
     * @param {number} runNumber run number
     * @return {Promise<GaqSummary|null>} promise of GAQ summary or null if it can't be computed
     */
    async _computeSummary(dataPassId, runNumber) {
        const gaqCoverages = await QcFlagRepository.getGaqCoverages(dataPassId, runNumber);
        const entry = gaqCoverages[runNumber];
        if (!entry) {
            return null;
        }

        const {
            badCoverage,
            mcReproducibleCoverage,
            goodCoverage,
            flagsIds,
            verifiedFlagsIds,
            undefinedQualityPeriodsCount,
        } = entry;

        return {
            badRunCoverage: badCoverage,
            explicitlyNotBadRunCoverage: goodCoverage,
            mcReproducibleCoverage,
            missingVerificationsCount: flagsIds.length - verifiedFlagsIds.length,
            undefinedQualityPeriodsCount,
        };
    }

    /**
     * Find QC flags in GAQ effective periods for given data pass and run
     *
     * @param {number} dataPassId id od data pass
     * @param {number} runNumber run number
     * @return {Promise<GaqFlags[]>} promise of aggregated QC flags
     */
    async getFlagsForDataPassAndRun(dataPassId, runNumber) {
        const gaqPeriods = await QcFlagRepository.findGaqPeriods(dataPassId, runNumber);
        const qcFlags = (await QcFlagRepository.findAll({
            where: { id: { [Op.in]: gaqPeriods.flatMap(({ contributingFlagIds }) => contributingFlagIds) } },
            include: [
                { association: 'flagType' },
                { association: 'createdBy' },
                { association: 'verifications', include: [{ association: 'createdBy' }] },
            ],
        })).map(qcFlagAdapter.toEntity);

        const idToFlag = Object.fromEntries(qcFlags.map((flag) => [flag.id, flag]));

        return gaqPeriods.map(({
            contributingFlagIds,
            from,
            to,
        }) => ({
            from,
            to,
            contributingFlags: contributingFlagIds.map((id) => idToFlag[id]),
        }));
    }

    /**
     * Calculate and store GAQ summary for given data pass and run
     * @param {number} dataPassId id of data pass
     * @param {number} runNumber run number
     * @param {object} [options] additional options
     * @param {Date} [options.expectedInvalidatedAt] if provided, invalidatedAt will only be cleared if it is equal to the provided value
     * @return {Promise<void>} promise
     */
    async calculateAndStoreGaqSummary(dataPassId, runNumber, { expectedInvalidatedAt } = {}) {
        const summary = await this._computeSummary(dataPassId, runNumber);

        const fields = {
            dataPassId,
            runNumber,
            badRunCoverage: summary?.badRunCoverage ?? null,
            explicitlyNotBadRunCoverage: summary?.explicitlyNotBadRunCoverage ?? null,
            mcReproducibleCoverage: summary?.mcReproducibleCoverage ?? null,
            missingVerificationsCount: summary?.missingVerificationsCount ?? null,
            undefinedQualityPeriodsCount: summary?.undefinedQualityPeriodsCount ?? null,
            notComputable: summary === null,
        };

        if (expectedInvalidatedAt === undefined) {
            // No expected invalidation time provided, just upsert the summary
            await GaqSummaryRepository.upsert({ dataPassId, runNumber, ...fields, invalidatedAt: null });
            return;
        };

        // Only clear invalidatedAt if it hasn't been changed during compute
        const [rows] = await GaqSummaryRepository.updateAll(
            { ...fields, invalidatedAt: null },
            { where: { dataPassId, runNumber, invalidatedAt: expectedInvalidatedAt } },
        );

        if (rows === 0) {
            // Write fresh summary fields but leave invalidatedAt unchanged
            await GaqSummaryRepository.updateAll(
                { ...fields },
                { where: { dataPassId, runNumber } },
            );
        }
    }

    /**
     * Remove invalid GAQ summaries and recalculate them
     * @param {number} batchSize maximum number of invalid summaries to process
     * @return {Promise<void>} promise
     */
    async popNInvalidSummaryAndRecalculate(batchSize = 1) {
        const { rows, count } = await GaqSummaryRepository.findAndCountAll({
            where: { invalidatedAt: { [Op.not]: null } },
            order: [['invalidatedAt', 'ASC']],
            limit: batchSize,
        });

        await Promise.all(rows.map(({ dataPassId, runNumber, invalidatedAt }) =>
            this.calculateAndStoreGaqSummary(dataPassId, runNumber, { expectedInvalidatedAt: invalidatedAt })));

        return { processedCount: rows.length, totalInvalidCount: count };
    }
}

exports.GaqService = GaqService;

exports.gaqService = new GaqService();
