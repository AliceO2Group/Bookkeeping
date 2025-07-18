'use strict';

const SELECT_RUNS_START_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT
        gaqd.data_pass_id,
        gaqd.run_number,
        r.qc_time_start                                      AS timestamp,
        COALESCE(r.qc_time_start, '0001-01-01 00:00:00.000') AS ordering_timestamp,
        r.qc_time_start                                      AS qc_run_start,
        r.qc_time_end                                        AS qc_run_end
    FROM global_aggregated_quality_detectors AS gaqd
    INNER JOIN runs as r ON gaqd.run_number = r.run_number
    INNER JOIN quality_control_flags AS qcf ON qcf.run_number = r.run_number
    INNER JOIN data_pass_quality_control_flag AS dpqcf
        ON dpqcf.quality_control_flag_id = qcf.id AND dpqcf.data_pass_id = gaqd.data_pass_id
`;

const SELECT_RUNS_END_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT
        gaqd.data_pass_id,
        gaqd.run_number,
        r.qc_time_end                    AS timestamp,
        COALESCE(r.qc_time_end, NOW(3))  AS ordering_timestamp,
        r.qc_time_start                  AS qc_run_start,
        r.qc_time_end                    AS qc_run_end
    FROM global_aggregated_quality_detectors AS gaqd
    INNER JOIN runs as r ON gaqd.run_number = r.run_number
    INNER JOIN quality_control_flags AS qcf ON qcf.run_number = r.run_number
    INNER JOIN data_pass_quality_control_flag AS dpqcf
        ON dpqcf.quality_control_flag_id = qcf.id AND dpqcf.data_pass_id = gaqd.data_pass_id
`;

const SELECT_QCF_EFFECTIVE_PERIODS_START_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT gaqd.data_pass_id,
        gaqd.run_number,
        COALESCE(qcfep.\`from\`, r.qc_time_start)                            AS timestamp,
        COALESCE(qcfep.\`from\`, r.qc_time_start, '0001-01-01 00:00:00.000') AS ordering_timestamp,
        r.qc_time_start                                                      AS qc_run_start,
        r.qc_time_end                                                        AS qc_run_end
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
`;

const SELECT_QCF_EFFECTIVE_PERIODS_END_TIMESTAMPS_FOR_GAQ_PERIODS = `
    SELECT gaqd.data_pass_id,
        gaqd.run_number,
        COALESCE(qcfep.\`to\`, r.qc_time_end)         AS timestamp,
        COALESCE(qcfep.\`to\`, r.qc_time_end, NOW(3)) AS ordering_timestamp,
        r.qc_time_start                               AS qc_run_start,
        r.qc_time_end                                 AS qc_run_end
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
`;

const CREATE_GAQ_PERIODS_VIEW = `
CREATE OR REPLACE VIEW gaq_periods AS
    SELECT 
        data_pass_id,
        run_number,
        \`from\`,
        \`to\`,
        from_ordering_timestamp,
        (UNIX_TIMESTAMP(\`to\`) - UNIX_TIMESTAMP(\`from\`)) / (UNIX_TIMESTAMP(qc_run_end) - UNIX_TIMESTAMP(qc_run_start)) AS coverage_ratio
    FROM (
        SELECT
            data_pass_id,
            run_number,
            LAG(timestamp) OVER w AS \`from\`,
            timestamp AS \`to\`,
            LAG(ordering_timestamp) OVER w AS from_ordering_timestamp,
            qc_run_start,
            qc_run_end
        FROM (
                -- Two selects for runs' timestamps (in case QC flag's eff. period doesn't start at run's start or end at run's end )
                ( ${SELECT_RUNS_START_TIMESTAMPS_FOR_GAQ_PERIODS} )
                UNION
                ( ${SELECT_RUNS_END_TIMESTAMPS_FOR_GAQ_PERIODS} )
                UNION
                -- Two selects for timestamps of QC flags' effective periods
                ( ${SELECT_QCF_EFFECTIVE_PERIODS_START_TIMESTAMPS_FOR_GAQ_PERIODS} )
                UNION
                ( ${SELECT_QCF_EFFECTIVE_PERIODS_END_TIMESTAMPS_FOR_GAQ_PERIODS} )

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

const DROP_GAQ_PERIODS_VIEW = 'DROP VIEW gaq_periods';

const CREATE_QC_FLAG_BLOCK_SIGNIFCANCE_AGGREGATE_FUNCTION = `
    CREATE OR REPLACE AGGREGATE FUNCTION qc_flag_block_significance(
        row_bad TINYINT(1),
        row_mc_reproducible TINYINT(1)
    ) RETURNS ENUM ('bad', 'mcr', 'good')
    BEGIN
        DECLARE mc_reproducible TINYINT(1) DEFAULT 0;
        DECLARE bad TINYINT(1) DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR NOT FOUND RETURN IF(bad, 'bad', IF(mc_reproducible, 'mcr', 'good'));
        LOOP
            FETCH group NEXT ROW;
            IF row_mc_reproducible THEN
                SET mc_reproducible = 1;
            ELSEIF row_bad THEN
                SET bad = 1;
            END IF;
        END LOOP;
    END
`;

const DROP_QC_FLAG_BLOCK_SIGNIFCANCE_AGGREGATE_FUNCTION = 'DROP FUNCTION qc_flag_block_significance';

const CREATE_QC_FLAG_BLOCK_SIGNIFCANCE_COVERAGE_AGGREGATE_FUNCTION = `
    CREATE OR REPLACE AGGREGATE FUNCTION qc_flag_block_significance_coverage(
        row_significance ENUM ('bad', 'mcr', 'good'), -- The significance of the row
        coverage_ratio FLOAT, -- The coverage ratio of the row
        significance ENUM ('bad', 'mcr', 'good') -- The significance to aggregate over
    ) RETURNS FLOAT
    BEGIN
        DECLARE coverage FLOAT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR NOT FOUND RETURN coverage;
        LOOP
            FETCH group NEXT ROW;
            IF row_significance = significance THEN
                SET coverage = coverage + coverage_ratio;
            END IF;
        END LOOP;
    END
`;

const DROP_QC_FLAG_BLOCK_SIGNIFCANCE_COVERAGE_AGGREGATE_FUNCTION = 'DROP FUNCTION qc_flag_block_significance_coverage';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(CREATE_GAQ_PERIODS_VIEW, { transaction });
        await queryInterface.sequelize.query(CREATE_QC_FLAG_BLOCK_SIGNIFCANCE_AGGREGATE_FUNCTION, { transaction });
        await queryInterface.sequelize.query(CREATE_QC_FLAG_BLOCK_SIGNIFCANCE_COVERAGE_AGGREGATE_FUNCTION, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DROP_GAQ_PERIODS_VIEW, { transaction });
        await queryInterface.sequelize.query(DROP_QC_FLAG_BLOCK_SIGNIFCANCE_AGGREGATE_FUNCTION, { transaction });
        await queryInterface.sequelize.query(DROP_QC_FLAG_BLOCK_SIGNIFCANCE_COVERAGE_AGGREGATE_FUNCTION, { transaction });
    }),
};
