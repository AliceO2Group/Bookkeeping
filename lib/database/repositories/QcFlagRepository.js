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

const GAQ_PERIODS_VIEW = `
    SELECT * FROM (
        SELECT
            data_pass_id,
            run_number,
            LAG(timestamp) OVER w AS \`from\`,
            timestamp AS \`to\`,
            LAG(ordering_timestamp) OVER w AS from_ordering_timestamp
        FROM (
                (
                    SELECT gaqd.data_pass_id,
                        gaqd.run_number,
                        COALESCE(qcfep.\`from\`, r.qc_time_start) AS timestamp,
                        COALESCE(qcfep.\`from\`, r.qc_time_start, '0001-01-01 00:00:00.000') AS ordering_timestamp
                    FROM quality_control_flag_effective_periods AS qcfep
                        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                        INNER JOIN runs AS r ON qcf.run_number = r.run_number
                        INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                        -- Only flags of detectors which are defined in global_aggregated_quality_detectors
                        -- should be taken into account for calculation of gaq_effective_periods
                        INNER JOIN global_aggregated_quality_detectors AS gaqd
                            ON gaqd.data_pass_id = dpqcf.data_pass_id
                            AND gaqd.run_number = qcf.run_number
                            AND gaqd.detector_id = qcf.detector_id
                )
                UNION
                (
                    SELECT gaqd.data_pass_id,
                        gaqd.run_number,
                        COALESCE(qcfep.\`to\`, r.qc_time_end) AS timestamp,
                        COALESCE(qcfep.\`to\`, r.qc_time_end, NOW()) AS ordering_timestamp
                    FROM quality_control_flag_effective_periods AS qcfep
                        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                        INNER JOIN runs AS r ON qcf.run_number = r.run_number
                        INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                        -- Only flags of detectors which are defined in global_aggregated_quality_detectors
                        -- should be taken into account for calculation of gaq_effective_periods
                        INNER JOIN global_aggregated_quality_detectors AS gaqd
                            ON gaqd.data_pass_id = dpqcf.data_pass_id
                            AND gaqd.run_number = qcf.run_number
                            AND gaqd.detector_id = qcf.detector_id
                )
                ORDER BY ordering_timestamp
        ) AS ap
        WINDOW w AS (
            PARTITION BY data_pass_id,
            run_number
            ORDER BY ap.ordering_timestamp
        )
    ) as gaq_periods_with_last_nullish_row
    WHERE gaq_periods_with_last_nullish_row.from_ordering_timestamp IS NOT NULL
    `;

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
 * @typedef RunGaqSubSummary aggregation of QC flags information by QcFlagType property `bad`
 *
 * @property {number} runNumber
 * @property {number} bad
 * @property {number} effectiveRunCoverage
 * @property {number[]} flagsIds
 * @property {number[]} verifiedFlagsIds
 * @property {number} mcReproducible
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
            INNER JOIN quality_control_flag_effective_periods AS qcfep
                ON qcf.id = qcfep.flag_id
            INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
            INNER JOIN (${GAQ_PERIODS_VIEW}) AS gaq_periods ON gaq_periods.data_pass_id = dpqcf.data_pass_id
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
            flagsList,
        }) => ({
            dataPassId,
            runNumber,
            from: from?.getTime(),
            to: to?.getTime(),
            contributingFlagIds: contributingFlagIds.split(',').map((id) => parseInt(id, 10)),
        }));
    }

    /**
     * Get GAQ sub-summaries for given data pass
     *
     * @param {number} dataPassId id of data pass id
     * @param {object} [options] additional options
     * @param {boolean} [options.mcReproducibleAsNotBad = false] if set to true,
     * `Limited Acceptance MC Reproducible` flag type is treated as good one
     * @return {Promise<RunGaqSubSummary[]>} Resolves with the GAQ sub-summaries
     */
    async getRunGaqSubSummaries(dataPassId, { mcReproducibleAsNotBad = false } = {}) {
        const effectivePeriodsWithTypeSubQuery = `
            SELECT
                gaq_periods.data_pass_id AS dataPassId,
                gaq_periods.run_number AS runNumber,
                gaq_periods.\`from\` AS \`from\`,
                gaq_periods.\`to\` AS \`to\`,
                SUM(IF(qcft.monte_carlo_reproducible AND :mcReproducibleAsNotBad, false, qcft.bad)) >= 1 AS bad,
                SUM(qcft.bad) = SUM(qcft.monte_carlo_reproducible) AND SUM(qcft.monte_carlo_reproducible) AS mcReproducible,
                GROUP_CONCAT( DISTINCT qcfv.flag_id ) AS verifiedFlagsList,
                GROUP_CONCAT( DISTINCT qcf.id ) AS flagsList

            FROM quality_control_flags AS qcf
            INNER JOIN quality_control_flag_types AS qcft
                ON qcft.id = qcf.flag_type_id
            LEFT JOIN quality_control_flag_verifications AS qcfv
                ON qcfv.flag_id = qcf.id
            INNER JOIN quality_control_flag_effective_periods AS qcfep
                ON qcf.id = qcfep.flag_id
            INNER JOIN data_pass_quality_control_flag AS dpqcf
                ON dpqcf.quality_control_flag_id = qcf.id
            INNER JOIN (${GAQ_PERIODS_VIEW}) AS gaq_periods
                ON gaq_periods.data_pass_id = dpqcf.data_pass_id
            INNER JOIN global_aggregated_quality_detectors AS gaqd
                ON gaqd.data_pass_id = gaq_periods.data_pass_id
                    AND gaqd.run_number = gaq_periods.run_number
                    AND gaqd.detector_id = qcf.detector_id
                    AND gaq_periods.run_number = qcf.run_number
                        AND (qcfep.\`from\` IS NULL OR qcfep.\`from\` <= gaq_periods.\`from\`)
                        AND (qcfep.\`to\`   IS NULL OR gaq_periods.\`to\` <= qcfep.\`to\`)

            GROUP BY
                gaq_periods.data_pass_id,
                gaq_periods.run_number,
                gaq_periods.\`from\`,
                gaq_periods.\`to\`
            `;

        const query = `
            SELECT
                gaq_periods.runNumber,
                gaq_periods.dataPassId,
                gaq_periods.bad,
                gaq_periods.badWhenMcReproducibleAsNotBad,
                SUM(gaq_periods.mcReproducible) > 0 AS mcReproducible,
                GROUP_CONCAT(gaq_periods.verifiedFlagsList) AS verifiedFlagsList,
                GROUP_CONCAT(gaq_periods.flagsList) AS flagsList,

                IF(
                    run.qc_time_start IS NULL OR run.qc_time_end IS NULL,
                    IF(
                        gaq_periods.\`from\` IS NULL AND gaq_periods.\`to\`  IS NULL,
                        1,
                        null
                    ),
                    SUM(
                        UNIX_TIMESTAMP(COALESCE(effectivePeriods.\`to\`,run.qc_time_end))
                        - UNIX_TIMESTAMP(COALESCE(effectivePeriods.\`from\`, run.qc_time_start))
                    ) / (UNIX_TIMESTAMP(run.qc_time_end) - UNIX_TIMESTAMP(run.qc_time_start))
                ) AS effectiveRunCoverage

            FROM gaq_periods
            INNER JOIN runs AS run ON run.run_number = gaq_periods.runNumber

            WHERE gaq_periods.dataPassId = :dataPassId

            GROUP BY
                gaq_periods.dataPassId,
                gaq_periods.runNumber,
                gaq_periods.bad
        `;

        const [rows] = await this.model.sequelize.query(query, { replacements: { dataPassId } });
        return rows.map(({
            runNumber,
            bad,
            badWhenMcReproducibleAsNotBad,
            effectiveRunCoverage,
            mcReproducible,
            flagsList,
            verifiedFlagsList,
        }) => {
            if ((effectiveRunCoverage ?? null) != null) {
                effectiveRunCoverage = Math.min(1, Math.max(0, parseFloat(effectiveRunCoverage)));
            }

            return {
                runNumber,
                bad,
                effectiveRunCoverage,
                mcReproducible: Boolean(mcReproducible),
                flagsIds: [...new Set(flagsList.split(','))],
                verifiedFlagsIds: verifiedFlagsList ? [...new Set(verifiedFlagsList.split(','))] : [],
            };
        });
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
