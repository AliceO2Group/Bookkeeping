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

const { Op } = require('sequelize');
const { models: { QcFlag } } = require('..');
const Repository = require('./Repository');

/**
 * @typedef GaqPeriod
 *
 * @property {number} dataPassId
 * @property {number} runNumber
 * @property {number} from
 * @property {number} to
 * @property {number[]} contributingFlagIds IDs of QC flags which together define global aggregated quality in the period [from, to]
 */

/**
 * @typedef RunGaqSubSummary aggregation of QC flags information by QcFlagType property `bad` and `mc_reproducible`
 *
 * @property {number} badCoverage
 * @property {number} mcReproducibleCoverage
 * @property {number} goodCoverage
 * @property {number} totalCoverage
 * @property {number[]} flagsIds
 * @property {number[]} verifiedFlagsIds
 */

/**
 * Sequelize implementation of the QcFlagRepository
 */
class QcFlagRepository extends Repository {
    /**
     * Creates a new `QcFlagRepository` instance.
     */
    constructor() {
        super(QcFlag);
    }

    /**
     * Find GAQ periods for given data pass and run
     *
     * @param {number} dataPassId id of data pass id
     * @param {number} runNumber run number
     * @return {Promise<GaqPeriod[]>} Resolves with the GAQ periods
     */
    async findGaqPeriods(dataPassId, runNumber) {
        const query = `
            SELECT
                gaq_periods.data_pass_id AS dataPassId,
                gaq_periods.run_number AS runNumber,
                gaq_periods.\`from\` AS \`from\`,
                gaq_periods.\`to\` AS \`to\`,
                group_concat(qcf.id) AS contributingFlagIds

            FROM quality_control_flags AS qcf
            INNER JOIN quality_control_flag_effective_periods AS qcfep ON qcf.id = qcfep.flag_id
            INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
            INNER JOIN gaq_periods ON gaq_periods.data_pass_id = dpqcf.data_pass_id
            INNER JOIN global_aggregated_quality_detectors AS gaqd
                ON gaqd.data_pass_id = gaq_periods.data_pass_id
                AND gaqd.run_number = gaq_periods.run_number
                AND gaqd.detector_id = qcf.detector_id
                AND gaq_periods.run_number = qcf.run_number
                AND (qcfep.\`from\` IS NULL OR qcfep.\`from\` <= gaq_periods.\`from\`)
                AND (qcfep.\`to\`   IS NULL OR gaq_periods.\`to\` <= qcfep.\`to\`)
    
            WHERE gaq_periods.data_pass_id = ${dataPassId}
                ${runNumber ? `AND gaq_periods.run_number = ${runNumber}` : ''}
    
            GROUP BY gaq_periods.run_number,
                gaq_periods.data_pass_id,
                gaq_periods.\`from\`,
                gaq_periods.\`to\`;
            `;

        const [rows] = await this.model.sequelize.query(query);
        return rows.map(({
            dataPassId,
            runNumber,
            from,
            to,
            contributingFlagIds,
        }) => ({
            dataPassId,
            runNumber,
            from: from?.getTime(),
            to: to?.getTime(),
            contributingFlagIds: contributingFlagIds.split(',').map((id) => parseInt(id, 10)),
        }));
    }

    /**
     * Return the good, bad and MC reproducible coverage per runs for a given data pass
     * and informtion about missing and unverified flags
     *
     * @param {number} dataPassId the id of a data-pass
     * @return {Promise<Object.<number, RunGaqSubSummary>>} resolves with the map between run number and the corresponding run GAQ summary
     */
    async getGaqCoverages(dataPassId) {
        const blockAggregationQuery = `
            SELECT 
                gaq_periods.data_pass_id,
                gaq_periods.run_number,
                gaq_periods.coverage_ratio,
                IF(
                    COUNT(DISTINCT qcf.id) = COUNT( DISTINCT gaqd.detector_id),
                    qc_flag_block_significance(qcft.bad, qcft.monte_carlo_reproducible),
                    NULL) AS significance,
                GROUP_CONCAT( DISTINCT qcfv.flag_id )                     AS verified_flags_list,
                GROUP_CONCAT( DISTINCT qcfep.flag_id )                    AS flags_list,
                COUNT(DISTINCT gaqd.detector_id) - COUNT(DISTINCT qcf.id) AS undefined_quality_periods_count,

            FROM gaq_periods

            INNER JOIN global_aggregated_quality_detectors AS gaqd
                ON gaqd.data_pass_id = gaq_periods.data_pass_id
                AND gaqd.run_number = gaq_periods.run_number

            LEFT JOIN (
                data_pass_quality_control_flag AS dpqcf
                INNER JOIN quality_control_flags AS qcf ON dpqcf.quality_control_flag_id = qcf.id
                INNER JOIN quality_control_flag_types AS qcft ON qcft.id = qcf.flag_type_id
                INNER JOIN quality_control_flag_effective_periods AS qcfep ON qcf.id = qcfep.flag_id
                LEFT JOIN quality_control_flag_verifications AS qcfv ON qcfv.flag_id = qcf.id
            ) 
                ON gaq_periods.data_pass_id = dpqcf.data_pass_id
                AND qcf.run_number = gaq_periods.run_number
                AND gaqd.detector_id = qcf.detector_id
                AND gaq_periods.run_number = qcf.run_number
                AND (qcfep.from IS NULL OR qcfep.\`from\` < gaq_periods.\`to\`)
                AND (qcfep.to IS NULL OR qcfep.\`to\` > gaq_periods.\`from\`)

            WHERE gaq_periods.data_pass_id = :dataPassId
            GROUP BY gaq_periods.data_pass_id, gaq_periods.run_number, gaq_periods.\`from\`, gaq_periods.to
        `;

        const summaryQuery = `
                SELECT 
                    data_pass_id,
                    run_number,
                    qc_flag_block_significance_coverage(gaq.significance, coverage_ratio, 'bad')  AS bad_coverage,
                    qc_flag_block_significance_coverage(gaq.significance, coverage_ratio, 'mcr')  AS mcr_coverage,
                    qc_flag_block_significance_coverage(gaq.significance, coverage_ratio, 'good') AS good_coverage,
                    GROUP_CONCAT(verified_flags_list)                                             AS verified_flags_list,
                    GROUP_CONCAT(flags_list)                                                      AS flags_list,
                    SUM(undefined_quality_periods_count)                                          AS undefined_quality_periods_count

                FROM (${blockAggregationQuery}) AS gaq
                GROUP BY gaq.data_pass_id, gaq.run_number;
            `;
        const [rows] = await this.model.sequelize.query(summaryQuery, { replacements: { dataPassId } });
        const entries = rows.map(
            ({
                run_number,
                bad_coverage,
                mcr_coverage,
                good_coverage,
                flags_list,
                verifiedd_flags_list,
                undefined_quality_periods_count,
            }) => [
                run_number,
                {
                    badCoverage: parseFloat(bad_coverage ?? '0'),
                    mcReproducibleCoverage: parseFloat(mcr_coverage ?? '0'),
                    goodCoverage: parseFloat(good_coverage ?? '0'),
                    flagsIds: [...new Set(flags_list?.split(','))],
                    verifiedFlagsIds: [...new Set(verifiedd_flags_list?.split(','))],
                    undefinedQualityPeriodsCount: undefined_quality_periods_count,
                },
            ],
        );

        return Object.fromEntries(entries);
    }

    /**
     * Find all QC flags created before and after given one for the same run, detector, data/simulation pass.
     * Flags are sorted by createdAt property in ascending manner
     * @param {number} id id of QC flag
     * @return {Promise<{ after: SequelizeQcFlag[], before: SequelizeQcFlag[] }>} QC flags created before and after given one
     */
    async findFlagsCreatedAfterAndBeforeGivenOne(id) {
        const qcFlag = await this.findOne({
            where: { id, deleted: false },
            include: [{ association: 'dataPasses' }, { association: 'simulationPasses' }],
        });

        const { runNumber, detectorId, createdAt } = qcFlag;
        const dataPasses = qcFlag.get('dataPasses');
        const simulationPasses = qcFlag.get('simulationPasses');

        const dataPassId = dataPasses[0]?.id;
        const simulationPassId = simulationPasses[0]?.id;

        const flagIncludes = [];
        let synchronousQcWhereClause = {};

        // QC flag can be associated with only one data pass or only one simulation pass or be synchronous
        if (dataPassId !== undefined) {
            flagIncludes.push({ association: 'dataPasses', where: { id: dataPassId }, required: true });
        } else if (simulationPassId !== undefined) {
            flagIncludes.push({ association: 'simulationPasses', where: { id: simulationPassId }, required: true });
        } else {
            flagIncludes.push({ association: 'dataPasses', required: false });
            flagIncludes.push({ association: 'simulationPasses', required: false });
            synchronousQcWhereClause = { '$dataPasses.id$': null, '$simulationPasses.id$': null };
        }

        const flagsCreatedAfterRemovedFlag = await this.findAll({
            where: {
                deleted: false,
                detectorId,
                runNumber,
                createdAt: { [Op.gt]: createdAt },
                ...synchronousQcWhereClause,
            },
            include: flagIncludes,
            sort: [['createdAt', 'ASC']],
        });

        const flagsCreatedBeforeRemovedFlag = await this.findAll({
            where: {
                id: { [Op.not]: id },
                deleted: false,
                detectorId,
                runNumber,
                createdAt: { [Op.lte]: createdAt },
                ...synchronousQcWhereClause,
            },
            include: flagIncludes,
            sort: [['createdAt', 'ASC']],
        });

        return {
            before: flagsCreatedBeforeRemovedFlag,
            after: flagsCreatedAfterRemovedFlag,
        };
    }
}

module.exports = new QcFlagRepository();
