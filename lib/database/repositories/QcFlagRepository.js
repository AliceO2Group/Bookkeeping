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
        SELECT
            data_pass_id,
            run_number,
            timestamp AS \`from\`,
            NTH_VALUE(timestamp, 2) OVER (
                PARTITION BY data_pass_id,
                run_number
                ORDER BY ap.timestamp
                ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING
            ) AS \`to\`
        FROM (
                -- Two selects for runs' timestamps (in case QC flag doesn't tart at run's start or end at run's end )
                (
                    SELECT gaqd.data_pass_id,
                        gaqd.run_number,
                        COALESCE(UNIX_TIMESTAMP(COALESCE(first_tf_timestamp, time_trg_start, time_o2_start)), 0) AS timestamp
                    FROM global_aggregated_quality_detectors AS gaqd
                    INNER JOIN runs as r
                        ON gaqd.run_number = r.run_number
                )
                UNION
                (
                    SELECT gaqd.data_pass_id,
                        gaqd.run_number,
                        UNIX_TIMESTAMP(COALESCE(last_tf_timestamp, time_trg_end, time_o2_end, NOW())) AS timestamp
                    FROM global_aggregated_quality_detectors AS gaqd
                    INNER JOIN runs as r
                        ON gaqd.run_number = r.run_number
                )
                UNION
                -- Two selectes for timestamps of QC flags
                (
                    SELECT gaqd.data_pass_id,
                        gaqd.run_number,
                        COALESCE(UNIX_TIMESTAMP(qcfep.\`from\`), 0) AS timestamp
                    FROM quality_control_flag_effective_periods AS qcfep
                        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
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
                        UNIX_TIMESTAMP(COALESCE(qcfep.\`to\`, NOW())) AS timestamp
                    FROM quality_control_flag_effective_periods AS qcfep
                        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                        INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                        -- Only flags of detectors which are defined in global_aggregated_quality_detectors
                        -- should be taken into account for calculation of gaq_effective_periods
                        INNER JOIN global_aggregated_quality_detectors AS gaqd
                            ON gaqd.data_pass_id = dpqcf.data_pass_id
                            AND gaqd.run_number = qcf.run_number
                            AND gaqd.detector_id = qcf.detector_id
                )
                ORDER BY timestamp
            ) AS ap
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
                IF(gaq_periods.\`from\` = 0, null, gaq_periods.\`from\` * 1000) AS \`from\`,
                IF(gaq_periods.\`to\` = UNIX_TIMESTAMP(NOW()), null, gaq_periods.\`to\` * 1000) AS \`to\`,
                group_concat(qcfep.flag_id) AS contributingFlagIds

            FROM (${GAQ_PERIODS_VIEW}) AS gaq_periods
            INNER JOIN global_aggregated_quality_detectors AS gaqd
                ON gaqd.data_pass_id = gaq_periods.data_pass_id
                AND gaqd.run_number = gaq_periods.run_number
            INNER JOIN data_pass_quality_control_flag AS dpqcf
                ON gaq_periods.data_pass_id = dpqcf.data_pass_id
            INNER JOIN quality_control_flags AS qcf
                ON dpqcf.quality_control_flag_id = qcf.id
                AND qcf.run_number = gaq_periods.run_number
                AND gaqd.detector_id = qcf.detector_id
                AND gaq_periods.run_number = qcf.run_number
            LEFT JOIN quality_control_flag_effective_periods AS qcfep
                ON qcf.id = qcfep.flag_id
                AND (qcfep.\`from\` IS NULL OR UNIX_TIMESTAMP(qcfep.\`from\`) <= gaq_periods.\`from\`)
                AND (qcfep.\`to\`   IS NULL OR gaq_periods.\`to\` <= UNIX_TIMESTAMP(qcfep.\`to\`))
    
            WHERE IF(gaq_periods.\`to\` = UNIX_TIMESTAMP(NOW()), null, gaq_periods.\`to\` * 1000) IS NOT NULL
                AND gaq_periods.data_pass_id = ${dataPassId}
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
            from,
            to,
            contributingFlagIds: contributingFlagIds ? contributingFlagIds.split(',').map((id) => parseInt(id, 10)) : [],
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
                IF(gaq_periods.\`from\` = 0, null, gaq_periods.\`from\`) AS \`from\`,
                IF(gaq_periods.\`to\` = UNIX_TIMESTAMP(NOW()), null, gaq_periods.\`to\`) AS \`to\`,
                IF(COUNT( gaqd.detector_id ) != COUNT( DISTINCT qcfep.flag_id ),
                    null,
                    SUM(IF(qcft.monte_carlo_reproducible AND :mcReproducibleAsNotBad, false, qcft.bad)) >= 1
                ) AS bad,
                SUM(qcft.bad) = SUM(qcft.monte_carlo_reproducible) AND SUM(qcft.monte_carlo_reproducible) AS mcReproducible,
                GROUP_CONCAT( DISTINCT qcfv.flag_id ) AS verifiedFlagsList,
                GROUP_CONCAT( DISTINCT qcfep.flag_id ) AS flagsList

            FROM (${GAQ_PERIODS_VIEW}) AS gaq_periods
            INNER JOIN global_aggregated_quality_detectors AS gaqd
                ON gaqd.data_pass_id = gaq_periods.data_pass_id
                AND gaqd.run_number = gaq_periods.run_number
            INNER JOIN data_pass_quality_control_flag AS dpqcf
                ON gaq_periods.data_pass_id = dpqcf.data_pass_id
            INNER JOIN quality_control_flags AS qcf
                ON dpqcf.quality_control_flag_id = qcf.id
                AND qcf.run_number = gaq_periods.run_number
                AND gaqd.detector_id = qcf.detector_id
                AND gaq_periods.run_number = qcf.run_number
            LEFT JOIN quality_control_flag_effective_periods AS qcfep
                ON qcf.id = qcfep.flag_id
                AND (qcfep.\`from\` IS NULL OR UNIX_TIMESTAMP(qcfep.\`from\`) <= gaq_periods.\`from\`)
                AND (qcfep.\`to\`   IS NULL OR gaq_periods.\`to\` <= UNIX_TIMESTAMP(qcfep.\`to\`))
            
            LEFT JOIN quality_control_flag_verifications AS qcfv
                ON qcfv.flag_id = qcf.id
            INNER JOIN quality_control_flag_types AS qcft
                ON qcft.id = qcf.flag_type_id
        
            WHERE gaq_periods.\`to\` IS NOT null

            GROUP BY
                gaq_periods.data_pass_id,
                gaq_periods.run_number,
                gaq_periods.\`from\`,
                gaq_periods.\`to\`
            `;

        const query = `
            SELECT
                effectivePeriods.runNumber,
                effectivePeriods.dataPassId,
                effectivePeriods.bad,
                SUM(effectivePeriods.mcReproducible) > 0 AS mcReproducible,
                GROUP_CONCAT(effectivePeriods.verifiedFlagsList) AS verifiedFlagsList,
                GROUP_CONCAT(effectivePeriods.flagsList) AS flagsList,

                IF(
                    (
                        COALESCE(run.time_trg_end,   run.time_o2_end  ) IS NULL
                     OR COALESCE(run.time_trg_start, run.time_o2_start) IS NULL
                    ),
                    IF(
                        SUM(
                            COALESCE(effectivePeriods.\`to\`  , 0)
                          + COALESCE(effectivePeriods.\`from\`, 0)
                        ) = 0,
                        1,
                        null
                    ),
                    SUM(
                        COALESCE(
                            effectivePeriods.\`to\`,
                            UNIX_TIMESTAMP(run.time_trg_end),
                            UNIX_TIMESTAMP(run.time_o2_end)
                        )
                      - COALESCE(
                            effectivePeriods.\`from\`,
                            UNIX_TIMESTAMP(run.time_trg_start),
                            UNIX_TIMESTAMP(run.time_o2_start)
                        )
                    ) / (
                        UNIX_TIMESTAMP(COALESCE(run.time_trg_end,   run.time_o2_end))
                      - UNIX_TIMESTAMP(COALESCE(run.time_trg_start, run.time_o2_start))
                    )
                ) AS effectiveRunCoverage

            FROM (${effectivePeriodsWithTypeSubQuery}) AS effectivePeriods
            INNER JOIN runs AS run ON run.run_number = effectivePeriods.runNumber

            WHERE effectivePeriods.dataPassId = :dataPassId

            GROUP BY
                effectivePeriods.dataPassId,
                effectivePeriods.runNumber,
                effectivePeriods.bad
        `;

        const [rows] = await this.model.sequelize.query(query, { replacements: { dataPassId, mcReproducibleAsNotBad } });
        return rows.map(({
            runNumber,
            bad,
            effectiveRunCoverage,
            mcReproducible,
            flagsList,
            verifiedFlagsList,
        }) => ({
            runNumber,
            bad,
            effectiveRunCoverage: parseFloat(effectiveRunCoverage) || null,
            mcReproducible: Boolean(mcReproducible),
            flagsIds: flagsList ? [...new Set(flagsList.split(','))] : [],
            verifiedFlagsIds: verifiedFlagsList ? [...new Set(verifiedFlagsList.split(','))] : [],
        }));
    }

    /**
     * Find all QC flags created before and after given one for the same run, detector, data/simulation pass.
     * Flags are sorted by createdAt property in ascending manner
     * @param {number} id id of QC flag
     * @return {Promise<{ after: SequelizeQcFlag[], before: SequelizeQcFlag[] }>} QC flags created before and after given one
     */
    async findFlagsCreatedAfterAndBeforeGivenOne(id) {
        const qcFlag = await this.findOne({
            where: { id },
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
