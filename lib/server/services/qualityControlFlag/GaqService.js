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
const { QcFlagRepository } = require('../../../database/repositories/index.js');
const { QcFlagSummaryService } = require('./QcFlagSummaryService.js');
const { qcFlagAdapter } = require('../../../database/adapters/index.js');
const { Op } = require('sequelize');

/**
 * @typedef GaqSummary aggregated global quality summaries for given data pass
 * @type {Object<number, RunGaqSummary>} runNumber to RunGaqSummary mapping
 */

const QC_SUMMARY_PROPERTIES = {
    badEffectiveRunCoverage: 'badEffectiveRunCoverage',
    explicitlyNotBadEffectiveRunCoverage: 'explicitlyNotBadEffectiveRunCoverage',
    missingVerificationsCount: 'missingVerificationsCount',
    mcReproducible: 'mcReproducible',
};

/**
 * Globally aggregated quality (QC flags aggregated for a predefined list of detectors per runs) service
 */
class GaqService {
    /**
     * Get GAQ summary
     *
     * @param {number} dataPassId id of data pass id
     * @param {object} [options] additional options
     * @param {boolean} [options.mcReproducibleAsNotBad = false] if set to true,
     * `Limited Acceptance MC Reproducible` flag type is treated as good one
     * @return {Promise<GaqSummary[]>} Resolves with the GAQ Summary
     */
    async getSummary(dataPassId, { mcReproducibleAsNotBad = false } = {}) {
        await getOneDataPassOrFail({ id: dataPassId });
        const gaqCoverages = await QcFlagRepository.getGaqCoverages(dataPassId);
        const gaqSummary = Object.entries(gaqCoverages).map(([
            runNumber,
            {
                badCoverage,
                mcReproducibleCoverage,
                goodCoverage,
                undefinedQualityPeriodsCount,
            },
        ]) => [
            runNumber,
            {
                badEffectiveRunCoverage: badCoverage + (mcReproducibleAsNotBad ? 0 : mcReproducibleCoverage),
                explicitlyNotBadEffectiveRunCoverage: goodCoverage + (mcReproducibleAsNotBad ? mcReproducibleCoverage : 0),
                mcReproducible: mcReproducibleCoverage > 0,
                undefinedQualityPeriodsCount,
            },
        ]);

        return Object.fromEntries(gaqSummary);
    }

    // eslint-disable-next-line require-jsdoc
    async _old_getSummary(dataPassId, { mcReproducibleAsNotBad = false } = {}) {
        const runGaqSubSummaries = await QcFlagRepository._old_getRunGaqSubSummaries(dataPassId, { mcReproducibleAsNotBad });
        const summary = {};
        const flagsAndVerifications = {};

        // Fold list of subSummaries into one summary
        for (const subSummary of runGaqSubSummaries) {
            const {
                runNumber,
                flagsIds,
                verifiedFlagsIds,
            } = subSummary;

            if (!summary[runNumber]) {
                summary[runNumber] = { [QC_SUMMARY_PROPERTIES.mcReproducible]: false };
            }
            if (!flagsAndVerifications[runNumber]) {
                flagsAndVerifications[runNumber] = {};
            }

            const runSummary = summary[runNumber];

            const distinctRunFlagsIds = flagsAndVerifications[runNumber]?.distinctFlagsIds ?? [];
            const distinctRunVerifiedFlagsIds = flagsAndVerifications[runNumber]?.distinctVerifiedFlagsIds ?? [];

            flagsAndVerifications[runNumber] = {
                distinctFlagsIds: new Set([...distinctRunFlagsIds, ...flagsIds]),
                distinctVerifiedFlagsIds: new Set([...distinctRunVerifiedFlagsIds, ...verifiedFlagsIds]),
            };

            QcFlagSummaryService.mergeIntoSummaryUnit(runSummary, subSummary);
        }

        for (const [runNumber, { distinctFlagsIds, distinctVerifiedFlagsIds }] of Object.entries(flagsAndVerifications)) {
            summary[runNumber][QC_SUMMARY_PROPERTIES.missingVerificationsCount] = distinctFlagsIds.size - distinctVerifiedFlagsIds.size;
        }

        return summary;
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
}

exports.GaqService = GaqService;

exports.gaqService = new GaqService();
