/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status AS an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { Op } = require('sequelize');
const { models: { QcFlagEffectivePeriod } } = require('..');
const Repository = require('./Repository');

/**
 * @typedef GaqEffectivePeriods
 *
 * @property {number} dataPassId
 * @property {number} runNumber
 * @property {number} form
 * @property {number} to
 * @property {number[]} contributingFlagIds
 */

/**
 * Sequelize implementation of the QcFlagEffectivePeriodRepository
 */
class QcFlagEffectivePeriodRepository extends Repository {
    /**
     * Creates a new `QcFlagEffectivePeriodRepository` instance.
     */
    constructor() {
        super(QcFlagEffectivePeriod);
    }

    /**
     * Find intersection of effective periods of QC flags groupped by relations of GAQ detectors
     * TODO
     *
     * @param {number} scope.dataPassId id of data pass id
     * @param {number[]} [scope.runNumbers] list of run numbers
     * @return {Promise<GaqEffectivePeriods>} promise resolvesd once periods are calculated
     */
    async findGaqEffectivePeriods({ dataPassId, runNumbers }) {
        const effectivePeriodsAlterationPointsSelectionQuery = `
            SELECT 
                *,
                ROW_NUMBER() OVER (
                    PARTITION BY data_pass_id,
                    run_number
                    ORDER BY ap.\`type\`, ap.timestamp
                ) AS row_number
            FROM (
                    (
                        SELECT DISTINCT data_pass_id,
                            run_number,
                            qcfep.\`from\` AS timestamp,
                            'null-start' AS \`type\`
                        FROM quality_control_flag_effective_periods AS qcfep
                            INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                            INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                        WHERE qcfep.\`from\` IS NULL
                    )
                    UNION ALL
                    (
                        (
                            SELECT data_pass_id,
                                run_number,
                                qcfep.\`from\` AS timestamp,
                                'non-null-intermidiate' AS \`type\`
                            FROM quality_control_flag_effective_periods AS qcfep
                                INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                                INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                            WHERE qcfep.\`from\` IS NOT NULL
                        )
                        UNION
                        (
                            SELECT data_pass_id,
                                run_number,
                                qcfep.\`to\` AS timestamp,
                                'non-null-intermidiate' AS \`type\`
                            FROM quality_control_flag_effective_periods AS qcfep
                                INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                                INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                            WHERE qcfep.\`to\` IS NOT NULL
                        )
                        ORDER BY timestamp
                    )
                    UNION ALL
                    (
                        SELECT DISTINCT data_pass_id,
                            run_number,
                            qcfep.\`to\` AS timestamp,
                            'null-end' AS \`type\`
                        FROM quality_control_flag_effective_periods AS qcfep
                            INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                            INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                        WHERE qcfep.\`to\` IS NULL
                    )
                ) AS ap
        `;

        const query = `
        SELECT gaq_periods.data_pass_id AS dataPassId,
            gaq_periods.run_number AS runNumber,
            gaq_periods.\`from\`,
            gaq_periods.\`to\`,
            group_concat(qcf.id) AS contributingFlagIds
        FROM quality_control_flag_effective_periods AS qcfep
        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
        INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
        INNER JOIN (
            SELECT ap_from.data_pass_id,
                ap_from.run_number,
                ap_from.timestamp AS \`from\`,
                ap_to.timestamp AS \`to\`
            FROM (${effectivePeriodsAlterationPointsSelectionQuery}) AS ap_from
            INNER JOIN (${effectivePeriodsAlterationPointsSelectionQuery}) AS ap_to 
            ON ap_from.row_number = ap_to.row_number - 1
                AND ap_from.data_pass_id = ap_to.data_pass_id
                AND ap_from.run_number = ap_to.run_number
        ) AS gaq_periods ON gaq_periods.data_pass_id = dpqcf.data_pass_id
        INNER JOIN global_aggregated_quality_detectors AS gaqd
            ON gaqd.data_pass_id = gaq_periods.data_pass_id
                AND gaqd.run_number = gaq_periods.run_number
                AND gaqd.dpl_detector_id = qcf.dpl_detector_id
                AND gaq_periods.run_number = qcf.run_number
                AND COALESCE(UNIX_TIMESTAMP(qcfep.\`from\`), -1) <= COALESCE(UNIX_TIMESTAMP(gaq_periods.\`from\`), -1)
                AND COALESCE(UNIX_TIMESTAMP(gaq_periods.\`to\`), 10000000000000) <= COALESCE(UNIX_TIMESTAMP(qcfep.\`to\`), 10000000000000)

        WHERE gaq_periods.data_pass_id = ${dataPassId}
            ${runNumbers ? `AND gaq_periods.run_number IN (${runNumbers})` : ''}

        GROUP BY gaq_periods.run_number,
            gaq_periods.data_pass_id,
            gaq_periods.\`from\`,
            gaq_periods.\`to\`;
        `;

        return (await this.model.sequelize.query(query))[0]
            .map(({
                dataPassId,
                runNumber,
                from,
                to,
                contributingFlagIds,
            }) => ({
                dataPassId,
                runNumber,
                from: from?.getTime() ?? null,
                to: to?.getTime() ?? null,
                contributingFlagIds: contributingFlagIds.split(',').map((id) => parseInt(id, 10)),
            }));
    }

    /**
     * Find all effective periods overlapping with given period and created for QC flags
     * in given scope which were created not after given timestamp
     *
     * @param {Period} period period which effective periods must overlap with
     * @param {number|Date} createdAtUpperLimit upper limit of QC flags creation timestamp which effective periods are to be found
     * @param {number} [monalisaProduction.dataPassId] id of data pass, which the QC flag belongs to
     * @param {number} [monalisaProduction.simulationPassId] id of simulation pass, which the QC flags belongs to
     * @param {number} monalisaProduction.runNumber runNumber of run, which the QC flags belongs to
     * @param {number} monalisaProduction.dplDetectorId id of DPL detector, which the QC flags belongs to
     * @return {Promise<SequelizeQcFlagEffectivePeriod[]>} effective periods promise
     */
    async findOverlappingPeriodsCreatedNotAfter(period, createdAtUpperLimit, { dataPassId, simulationPassId, runNumber, dplDetectorId }) {
        const { to, from } = period;

        const flagIncludes = [];
        let synchronousQcWhereClause = {};

        // QC flag can be associated with only one data pass or only one simulation pass or be synchronous
        if (dataPassId !== null && dataPassId !== undefined) {
            flagIncludes.push({ association: 'dataPasses', WHERE: { id: dataPassId }, required: true });
        } else if (simulationPassId !== null && simulationPassId !== undefined) {
            flagIncludes.push({ association: 'simulationPasses', WHERE: { id: simulationPassId }, required: true });
        } else {
            flagIncludes.push({ association: 'dataPasses', required: false });
            flagIncludes.push({ association: 'simulationPasses', required: false });
            synchronousQcWhereClause = { '$flag->dataPasses.id$': null, '$flag->simulationPasses.id$': null };
        }

        const periodsIntersectionWhereClause = [];
        if (to) {
            periodsIntersectionWhereClause.push({
                [Op.or]: [
                    { from: null },
                    { from: { [Op.lt]: to } },
                ],
            });
        }
        if (from) {
            periodsIntersectionWhereClause.push({
                [Op.or]: [
                    { to: null },
                    { to: { [Op.gt]: from } },
                ],
            });
        }

        return this.findAll({
            subQuery: false,
            WHERE: {
                [Op.and]: [
                    ...periodsIntersectionWhereClause,
                    synchronousQcWhereClause,
                ],
            },
            include: [
                {
                    association: 'flag',
                    include: flagIncludes,
                    WHERE: {
                        [Op.and]: [
                            { dplDetectorId, runNumber },
                            { createdAt: { [Op.lte]: createdAtUpperLimit } },
                        ],
                    },
                },
            ],
        });
    }
}

module.exports = new QcFlagEffectivePeriodRepository();
