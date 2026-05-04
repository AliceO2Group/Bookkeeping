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
const { QcFlagRepository, GaqSummaryRepository, DataPassRunRepository } = require('../../../database/repositories/index.js');
const { qcFlagAdapter } = require('../../../database/adapters/index.js');
const { Op } = require('sequelize');
const { QcSummarProperties } = require('../../../domain/enums/QcSummaryProperties.js');
const { dataSource } = require('../../../database/DataSource.js');
const { LogManager } = require('@aliceo2/web-ui');
const { unpackNumberRange } = require('../../../utilities/rangeUtils.js');
const { splitStringToStringsTrimmed } = require('../../../utilities/stringUtils.js');

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

        const summaries = await GaqSummaryRepository.findAll({
            where,
        });

        const formattedSummaries = summaries.map((summary) => ({
            runNumber: summary.runNumber,
            summary: this._formatSummary(summary, mcReproducibleAsNotBad),
        }));

        if (runNumber) {
            return formattedSummaries.find((s) => s.runNumber === runNumber)?.summary ?? {};
        }
        return Object.fromEntries(formattedSummaries.map((s) => [s.runNumber, s.summary]));
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
            [QcSummarProperties.NOT_COMPUTABLE]: summary.notComputable,
            [QcSummarProperties.INVALIDATED_AT]: summary.invalidatedAt,
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
     * @param {number} dataPassId id of data pass
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
     * @return {Promise<void>} promise
     */
    async calculateAndStoreGaqSummary(dataPassId, runNumber) {
        const summary = await this._computeSummary(dataPassId, runNumber);
        await GaqSummaryRepository.upsert({ dataPassId, runNumber, ...summary, notComputable: summary === null, invalidatedAt: null });
    }

    /**
     * Remove invalid GAQ summaries and recalculate them
     * @param {number} batchSize maximum number of invalid summaries to process
     * @return {Promise<void>} promise
     */
    async popNInvalidSummaryAndRecalculate(batchSize = 1) {
        const invalidCount = await GaqSummaryRepository.count({ where: { invalidatedAt: { [Op.not]: null } } });
        const remaining = Math.min(batchSize, invalidCount);
        if (remaining === 0) {
            return;
        }
        for (let i = 0; i < remaining; i++) {
            await dataSource.transaction(async () => {
                const invalidation = await GaqSummaryRepository.findOne({
                    where: { invalidatedAt: { [Op.not]: null } },
                    order: [['invalidatedAt', 'ASC']],
                });
                if (!invalidation) {
                    return;
                }
                const { dataPassId, runNumber } = invalidation;
                await this.calculateAndStoreGaqSummary(dataPassId, runNumber);
            });
        }
    }

    /**
     * Recalculate summaries for given data pass and runs
     * @param {number} dataPassId data pass id
     * @param {number[]} [runNumbers] optional list of run numbers to recalculate. If not set, all runs will be considered
     * @return {Promise<number>} number of recalculated summaries
     */
    async recalculateSummaries(dataPassId, runNumbers) {
        const where = { dataPassId };
        let finalRunNumberList;

        if (runNumbers) {
            const runNumberCriteria = splitStringToStringsTrimmed(runNumbers, ',');
            finalRunNumberList = Array.from(unpackNumberRange(runNumberCriteria));
            where.runNumber = { [Op.in]: finalRunNumberList };
        }

        const summariesToRecalculate = await DataPassRunRepository.findAll({
            where,
            attributes: ['dataPassId', 'runNumber'],
        });

        for (const summary of summariesToRecalculate) {
            await GaqSummaryRepository.upsert({ dataPassId: summary.dataPassId, runNumber: summary.runNumber, invalidatedAt: new Date() });
        }

        return { summariesToRecalculate: summariesToRecalculate.length };
    }
}

exports.GaqService = GaqService;

exports.gaqService = new GaqService();
