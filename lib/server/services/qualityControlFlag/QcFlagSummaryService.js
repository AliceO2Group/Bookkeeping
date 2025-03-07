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
import { BadParameterError } from '../../errors/BadParameterError.js';
import { dataSource } from '../../../database/DataSource.js';
import { Op } from 'sequelize';
import { QcFlagRepository } from '../../../database/repositories/index.js';
import { qcFlagEffectivePeriodAdapter } from '../../../database/adapters/index.js';

/**
 * @typedef RunQcSummary
 * @type {Object<number, RunDetectorQcSummary>} dplDetectorID to RunDetectorQcSummary mappings
 */

/**
 * @typedef QcSummary
 * @type {Object<number, Object<number, RunQcSummary>>} runNumber to RunQcSummary mapping
 */

/**
 * @typedef RunDetectorQcSummary
 * @property {number} badEffectiveRunCoverage - fraction of run's data, marked explicitly with bad QC flag
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, marked explicitly with good QC flag
 * @property {number} missingVerificationsCount - number of not verified QC flags which are not discarded
 * @property {boolean} mcReproducible - states whether some Limited Acceptance MC Reproducible flag was assigned
 */

/**
 * @typedef RunDetectorQcSummary
 * @property {number} badEffectiveRunCoverage - fraction of run's data, marked explicitly with bad QC flag
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, marked explicitly with good QC flag
 * @property {number} missingVerificationsCount - number of not verified QC flags which are not discarded
 * @property {boolean} mcReproducible - states whether some Limited Acceptance MC Reproducible flag was assigned
 */

const QC_SUMMARY_PROPERTIES = {
    badEffectiveRunCoverage: 'badEffectiveRunCoverage',
    explicitlyNotBadEffectiveRunCoverage: 'explicitlyNotBadEffectiveRunCoverage',
    missingVerificationsCount: 'missingVerificationsCount',
    mcReproducible: 'mcReproducible',
};

/**
 * QC flag summary service
 */
export class QcFlagSummaryService {
    /**
     * Update RunDetectorQcSummary or RunGaqSummary with new information
     *
     * @param {RunDetectorQcSummary|RunGaqSummary} summaryUnit RunDetectorQcSummary or RunGaqSummary
     * @param {{ bad: boolean, effectiveRunCoverage: number, mcReproducible: boolean}} partialSummaryUnit new properties
     * to be applied to the summary object
     * @return {void}
     */
    static mergeIntoSummaryUnit(summaryUnit, partialSummaryUnit) {
        const {
            bad,
            effectiveRunCoverage,
            mcReproducible,
        } = partialSummaryUnit;

        if (bad) {
            summaryUnit[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = effectiveRunCoverage;
            summaryUnit[QC_SUMMARY_PROPERTIES.mcReproducible] =
                mcReproducible || summaryUnit[QC_SUMMARY_PROPERTIES.mcReproducible];
        } else {
            summaryUnit[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = effectiveRunCoverage;
            summaryUnit[QC_SUMMARY_PROPERTIES.mcReproducible] =
                mcReproducible || summaryUnit[QC_SUMMARY_PROPERTIES.mcReproducible];
        }
        if (summaryUnit[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] === undefined) {
            summaryUnit[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = 0;
        }
        if (summaryUnit[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] === undefined) {
            summaryUnit[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = 0;
        }
    }

    /**
     * Get QC summary for given data/simulation pass or synchronous QC flags for given LHC period
     *
     * @param {scope} scope of the QC flag
     * @param {number} [scope.dataPassId] data pass id - exclusive with other options
     * @param {number} [scope.simulationPassId] simulation pass id - exclusive with other options
     * @param {number} [scope.lhcPeriodId] id of LHC Period - exclusive with other options
     * @param {object} [options] additional options
     * @param {boolean} [options.mcReproducibleAsNotBad = false] if set to true, `Limited Acceptance MC Reproducible` flag type is treated as
     *     good one
     * @return {Promise<QcSummary[]>} summary
     */
    async getQcFlagsSummary({ dataPassId, simulationPassId, lhcPeriodId }, { mcReproducibleAsNotBad = false } = {}) {
        if (Boolean(dataPassId) + Boolean(simulationPassId) + Boolean(lhcPeriodId) > 1) {
            throw new BadParameterError('`dataPassId`, `simulationPassId` and `lhcPeriodId` are exclusive options');
        }

        const queryBuilder = dataSource.createQueryBuilder()
            .where('deleted').is(false);

        if (dataPassId) {
            queryBuilder
                .whereAssociation('dataPasses', 'id').is(dataPassId)
                .include({ association: 'run', attributes: [] });
        } else if (simulationPassId) {
            queryBuilder
                .whereAssociation('simulationPasses', 'id').is(simulationPassId)
                .include({ association: 'run', attributes: [] });
        } else {
            queryBuilder.include({ association: 'dataPasses', required: false })
                .include({ association: 'simulationPasses', required: false })
                .where('$dataPasses.id$').is(null)
                .where('$simulationPasses.id$').is(null)
                .include({ association: 'run', attributes: [], where: { lhcPeriodId } });
        }

        queryBuilder
            .include({ association: 'effectivePeriods', attributes: [], required: true })
            .include({ association: 'flagType', attributes: [] })
            .set('attributes', (sequelize) => [
                'runNumber',
                'detectorId',
                [sequelize.literal(`IF(\`flagType\`.monte_carlo_reproducible AND ${mcReproducibleAsNotBad}, false, \`flagType\`.bad)`), 'bad'],

                [
                    sequelize.literal(`
                    IF(
                        run.qc_time_start IS NULL OR run.qc_time_end IS NULL,
                        IF(
                            effectivePeriods.\`from\` IS NULL AND effectivePeriods.\`to\` IS NULL,
                            1,
                            null
                        ),
                        SUM(
                            UNIX_TIMESTAMP(COALESCE(effectivePeriods.\`to\`,run.qc_time_end))
                            - UNIX_TIMESTAMP(COALESCE(effectivePeriods.\`from\`, run.qc_time_start))
                        ) / (UNIX_TIMESTAMP(run.qc_time_end) - UNIX_TIMESTAMP(run.qc_time_start))
                    )
                    `),
                    'effectiveRunCoverage',
                ],
                [
                    sequelize.literal('GROUP_CONCAT( DISTINCT `QcFlag`.id )'),
                    'flagIds',
                ],
                [
                    sequelize.literal('SUM( `flagType`.monte_carlo_reproducible ) > 0'),
                    'mcReproducible',
                ],
            ])
            .groupBy('runNumber')
            .groupBy('detectorId')
            .groupBy((sequelize) => sequelize.literal(`
                IF(\`flagType\`.monte_carlo_reproducible AND ${mcReproducibleAsNotBad}, false, \`flagType\`.bad)
            `));

        const runDetectorSummaryList = (await QcFlagRepository.findAll(queryBuilder))
            .map((summaryDb) => {
                const effectiveRunCoverageString = summaryDb.get('effectiveRunCoverage');
                const effectiveRunCoverage = (effectiveRunCoverageString ?? null) !== null
                    ? parseFloat(effectiveRunCoverageString)
                    : null;
                console.log(effectiveRunCoverageString);

                return {
                    runNumber: summaryDb.runNumber,
                    detectorId: summaryDb.detectorId,
                    effectiveRunCoverage,
                    bad: Boolean(summaryDb.get('bad')),
                    flagIds: (summaryDb.get('flagIds')?.split(',') ?? []).map((id) => parseInt(id, 10)),
                    mcReproducible: Boolean(summaryDb.get('mcReproducible')),
                };
            });

        const allFlagsIds = new Set(runDetectorSummaryList.flatMap(({ flagIds }) => flagIds));
        const notVerifiedFlagsIds = new Set((await QcFlagRepository.findAll({
            attributes: ['id'],
            include: [{ association: 'verifications', required: false, attributes: [] }],
            where: {
                id: { [Op.in]: [...allFlagsIds] },
                '$verifications.id$': { [Op.is]: null },
            },
        })).map(({ id }) => id));

        const summary = {};

        // Fold list of summaries into nested object
        for (const runDetectorSummaryForFlagTypesClass of runDetectorSummaryList) {
            const {
                runNumber,
                detectorId,
                flagIds,
            } = runDetectorSummaryForFlagTypesClass;
            const missingVerificationsCount = flagIds.filter((id) => notVerifiedFlagsIds.has(id)).length;

            if (!summary[runNumber]) {
                summary[runNumber] = {};
            }
            if (!summary[runNumber][detectorId]) {
                summary[runNumber][detectorId] = { [QC_SUMMARY_PROPERTIES.mcReproducible]: false };
            }

            const runDetectorSummary = summary[runNumber][detectorId];

            runDetectorSummary[QC_SUMMARY_PROPERTIES.missingVerificationsCount] =
                (runDetectorSummary[QC_SUMMARY_PROPERTIES.missingVerificationsCount] ?? 0) + missingVerificationsCount;

            QcFlagSummaryService.mergeIntoSummaryUnit(runDetectorSummary, runDetectorSummaryForFlagTypesClass);
        }

        return summary;
    }
}

export const qcFlagSummaryService = new QcFlagSummaryService();
