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
const { QcFlagRepository, GaqSummaryRepository, GaqSummaryInvalidationRepository } = require('../../../database/repositories/index.js');
const { qcFlagAdapter } = require('../../../database/adapters/index.js');
const { Op } = require('sequelize');
const { QcSummarProperties } = require('../../../domain/enums/QcSummaryProperties.js');
const { dataSource } = require('../../../database/DataSource.js');
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
        const gaqCoverages = await QcFlagRepository.getGaqCoverages(dataPassId, runNumber);
        const gaqSummary = Object.entries(gaqCoverages).map(([
            runNumberMapped,
            {
                badCoverage,
                mcReproducibleCoverage,
                goodCoverage,
                flagsIds,
                verifiedFlagsIds,
                undefinedQualityPeriodsCount,
            },
        ]) => [
            runNumberMapped,
            {
                [QcSummarProperties.BAD_EFFECTIVE_RUN_COVERAGE]: badCoverage + (mcReproducibleAsNotBad ? 0 : mcReproducibleCoverage),
                [QcSummarProperties.EXPLICITELY_NOT_BAD_EFFECTIVE_RUN_COVERAGE]:
                    goodCoverage + (mcReproducibleAsNotBad ? mcReproducibleCoverage : 0),
                [QcSummarProperties.MC_REPRODUCIBLE]: mcReproducibleCoverage > 0,
                [QcSummarProperties.MISSING_VERIFICATIONS]: flagsIds.length - verifiedFlagsIds.length,
                [QcSummarProperties.UNDEFINED_QUALITY_PERIODS_COUNT]: undefinedQualityPeriodsCount,
            },
        ]);

        /**
         * If runNumber is specified, only one summary is returned but the getGaqCoverages
         * returns still with runNumber as key, so we extract the single value from the array.
         */
        if (runNumber && gaqSummary.length === 1) {
            return Object.fromEntries(gaqSummary)[runNumber];
        }

        return Object.fromEntries(gaqSummary);
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
            badEffectiveRunCoverage: badCoverage + mcReproducibleCoverage,
            explicitlyNotBadEffectiveRunCoverage: goodCoverage,
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
     * @return {Promise<void>} promise
     */
    async calculateAndStoreGaqSummary(dataPassId, runNumber) {
        const summary = await this._computeSummary(dataPassId, runNumber);
        if (!summary) {
            return;
        }
        await GaqSummaryRepository.upsert({ dataPassId, runNumber, ...summary });
    }

    /**
     * Remove invalid GAQ summaries and recalculate them
     * @param {number} batchSize maximum number of invalid summaries to process
     * @return {Promise<void>} promise
     */
    async popNInvalidSummaryAndRecalculate(batchSize = 1) {
        const invalidCount = await GaqSummaryInvalidationRepository.count();
        const remaining = Math.min(batchSize, invalidCount);
        if (remaining === 0) {
            return;
        }
        await dataSource.transaction(async () => {
            for (let i = 0; i < remaining; i++) {
                const invalidation = await GaqSummaryInvalidationRepository.removeOne({ where: {}, order: [['createdAt', 'ASC']] });
                if (!invalidation) {
                    break;
                }
                const { dataPassId, runNumber } = invalidation;
                await this.calculateAndStoreGaqSummary(dataPassId, runNumber);
            }
        });
    }
}

exports.GaqService = GaqService;

exports.gaqService = new GaqService();
