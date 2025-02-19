'use strict';

const SELECT_RUNS_FROM_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT
        gaqd.data_pass_id,
        gaqd.run_number,
        COALESCE(UNIX_TIMESTAMP(first_tf_timestamp), UNIX_TIMESTAMP(time_start), 0) AS ordering_timestamp,
        UNIX_TIMESTAMP(COALESCE(first_tf_timestamp, time_start))                    AS timestamp
    FROM global_aggregated_quality_detectors AS gaqd
    INNER JOIN runs as r
        ON gaqd.run_number = r.run_number
`;

const SELECT_RUNS_TO_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT
        gaqd.data_pass_id,
        gaqd.run_number,
        UNIX_TIMESTAMP(COALESCE(last_tf_timestamp, time_end, NOW(3))) AS ordering_timestamp,
        UNIX_TIMESTAMP(COALESCE(last_tf_timestamp, time_end))         AS timestamp
    FROM global_aggregated_quality_detectors AS gaqd
    INNER JOIN runs as r
        ON gaqd.run_number = r.run_number
`;

const SELECT_QCF_EFFECTIVE_PERIODS_FROM_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT
        gaqd.data_pass_id,
        gaqd.run_number,
        COALESCE(UNIX_TIMESTAMP(qcfep.\`from\`), 0) AS ordering_timestamp,
        UNIX_TIMESTAMP(qcfep.\`from\`)              AS timestamp
    FROM quality_control_flag_effective_periods AS qcfep
        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
        INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
        -- Only flags of detectors which are defined in global_aggregated_quality_detectors
        -- should be taken into account for calculation of gaq_effective_periods
        INNER JOIN global_aggregated_quality_detectors AS gaqd
            ON gaqd.data_pass_id = dpqcf.data_pass_id
            AND gaqd.run_number = qcf.run_number
            AND gaqd.detector_id = qcf.detector_id
`;

const SELECT_QCF_EFFECTIVE_PERIODS_TO_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT
        gaqd.data_pass_id,
        gaqd.run_number,
        UNIX_TIMESTAMP(COALESCE(qcfep.\`to\`, NOW(3))) AS ordering_timestamp,
        UNIX_TIMESTAMP(COALESCE(qcfep.\`to\`))         AS timestamp
    FROM quality_control_flag_effective_periods AS qcfep
        INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
        INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
        -- Only flags of detectors which are defined in global_aggregated_quality_detectors
        -- should be taken into account for calculation of gaq_effective_periods
        INNER JOIN global_aggregated_quality_detectors AS gaqd
            ON gaqd.data_pass_id = dpqcf.data_pass_id
            AND gaqd.run_number = qcf.run_number
            AND gaqd.detector_id = qcf.detector_id
`;

const CREATE_GAQ_PERIODS_TIMESTAMPS_VIEW = `
CREATE OR REPLACE VIEW gaq_periods_timestamps AS
    SELECT * FROM (
        SELECT
            data_pass_id,
            run_number,
            timestamp AS \`from\`,
            NTH_VALUE(timestamp, 2) OVER (
                PARTITION BY data_pass_id,
                run_number
                ORDER BY ap.ordering_timestamp
                ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING
            ) AS \`to\`,
            NTH_VALUE(ordering_timestamp, 2) OVER (
                PARTITION BY data_pass_id,
                run_number
                ORDER BY ap.ordering_timestamp
                ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING
            ) AS \`to_ordering_timestamp\`
        FROM (
                -- Two selects for runs' timestamps (in case QC flag's eff. period doesn't start at run's start or end at run's end )
                ( ${SELECT_RUNS_FROM_TIMESTAMPS_FOR_GAQ_PERIODS} )
                UNION
                ( ${SELECT_RUNS_TO_TIMESTAMPS_FOR_GAQ_PERIODS} )
                UNION
                -- Two selects for timestamps of QC flags' effective periods
                ( ${SELECT_QCF_EFFECTIVE_PERIODS_FROM_TIMESTAMPS_FOR_GAQ_PERIODS} )
                UNION
                ( ${SELECT_QCF_EFFECTIVE_PERIODS_TO_TIMESTAMPS_FOR_GAQ_PERIODS} )

                ORDER BY ordering_timestamp
            ) AS ap
    ) AS gaq_periods_with_last_nullish_row
    WHERE gaq_periods_with_last_nullish_row.\`to_ordering_timestamp\` IS NOT NULL
    `;

const DROP_GAQ_PERIODS_TIMESTAMPS_VIEW = 'DROP VIEW gaq_periods_timestamps';

const CREATE_GAQ_PERIODS_VIEW = `
CREATE OR REPLACE VIEW gaq_periods AS
SELECT
    gaq_periods_timestamps.data_pass_id AS dataPassId,
    gaq_periods_timestamps.run_number AS runNumber,
    gaq_periods_timestamps.\`from\` AS \`from\`,
    gaq_periods_timestamps.\`to\` AS \`to\`,
    
    IF(COUNT( DISTINCT gaqd.detector_id ) > COUNT( DISTINCT qcfep.flag_id ),
        null,
        SUM(qcft.bad) >= 1
    ) AS bad,
    IF(COUNT( DISTINCT gaqd.detector_id ) > COUNT( DISTINCT qcfep.flag_id ),
        null,
        SUM(IF(qcft.monte_carlo_reproducible, false, qcft.bad)) >= 1
    ) AS badWhenMcReproducibleAsNotBad,
    SUM(qcft.bad) = SUM(qcft.monte_carlo_reproducible) AND SUM(qcft.monte_carlo_reproducible) AS mcReproducible,
    GROUP_CONCAT( DISTINCT qcfv.flag_id ) AS verifiedFlagsList,
    GROUP_CONCAT( DISTINCT qcfep.flag_id ) AS flagsList

FROM gaq_periods_timestamps
INNER JOIN global_aggregated_quality_detectors AS gaqd
    ON gaqd.data_pass_id = gaq_periods_timestamps.data_pass_id
    AND gaqd.run_number = gaq_periods_timestamps.run_number

LEFT JOIN (
    data_pass_quality_control_flag AS dpqcf
    INNER JOIN quality_control_flags AS qcf
        ON dpqcf.quality_control_flag_id = qcf.id
    INNER JOIN quality_control_flag_types AS qcft
        ON qcft.id = qcf.flag_type_id
    INNER JOIN quality_control_flag_effective_periods AS qcfep
        ON qcf.id = qcfep.flag_id
    LEFT JOIN quality_control_flag_verifications AS qcfv
        ON qcfv.flag_id = qcf.id
)
    ON gaq_periods_timestamps.data_pass_id = dpqcf.data_pass_id
    AND qcf.run_number = gaq_periods_timestamps.run_number
    AND gaqd.detector_id = qcf.detector_id
    AND gaq_periods_timestamps.run_number = qcf.run_number
    AND (qcfep.\`from\` IS NULL OR UNIX_TIMESTAMP(qcfep.\`from\`) <= gaq_periods_timestamps.\`from\`)
    AND (qcfep.\`to\`   IS NULL OR gaq_periods_timestamps.\`to\` <= UNIX_TIMESTAMP(qcfep.\`to\`))

WHERE gaq_periods_timestamps.\`to\` IS NOT null

GROUP BY
    gaq_periods_timestamps.data_pass_id,
    gaq_periods_timestamps.run_number,
    gaq_periods_timestamps.\`from\`,
    gaq_periods_timestamps.\`to\`
`;

const DROP_GAQ_PERIODS_VIEW = 'DROP VIEW gaq_periods';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(CREATE_GAQ_PERIODS_TIMESTAMPS_VIEW, { transaction });
        await queryInterface.sequelize.query(CREATE_GAQ_PERIODS_VIEW, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DROP_GAQ_PERIODS_VIEW, { transaction });
        await queryInterface.sequelize.query(DROP_GAQ_PERIODS_TIMESTAMPS_VIEW, { transaction });
    }),
};
