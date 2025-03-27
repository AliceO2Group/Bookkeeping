'use strict';

const CREATE_GAQ_PERIODS_VIEW = `
CREATE OR REPLACE VIEW gaq_periods AS
(
SELECT data_pass_id,
       run_number,
       \`from\`,
       \`to\`,
       (UNIX_TIMESTAMP(\`to\`) - UNIX_TIMESTAMP(\`from\`)) /
       (UNIX_TIMESTAMP(run_end) - UNIX_TIMESTAMP(run_start)) AS coverage_ratio
FROM (SELECT data_pass_id,
             run_number,
             LAG(timestamp) OVER w          AS \`from\`,
             timestamp                      AS \`to\`,
             run_start,
             run_end,
             LAG(ordering_timestamp) OVER w AS from_ordering_timestamp
      FROM ((SELECT gaqd.data_pass_id,
                    gaqd.run_number,
                    COALESCE(qcfep.\`from\`, r.qc_time_start)                            AS timestamp,
                    COALESCE(qcfep.\`from\`, r.qc_time_start, '0001-01-01 00:00:00.000') AS ordering_timestamp,
                    r.qc_time_start                                                    AS run_start,
                    r.qc_time_end                                                      AS run_end
             FROM quality_control_flag_effective_periods AS qcfep
                      INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                      INNER JOIN runs AS r ON qcf.run_number = r.run_number
                      INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                 -- Only flags of detectors which are defined in global_aggregated_quality_detectors
                 -- should be taken into account for calculation of gaq_effective_periods
                      INNER JOIN global_aggregated_quality_detectors AS gaqd
                                 ON gaqd.data_pass_id = dpqcf.data_pass_id
                                     AND gaqd.run_number = qcf.run_number
                                     AND gaqd.detector_id = qcf.detector_id)
            UNION
            (SELECT gaqd.data_pass_id,
                    gaqd.run_number,
                    COALESCE(qcfep.\`to\`, r.qc_time_end)        AS timestamp,
                    COALESCE(qcfep.\`to\`, r.qc_time_end, NOW()) AS ordering_timestamp,
                    r.qc_time_start                            AS run_start,
                    r.qc_time_end                              AS run_end
             FROM quality_control_flag_effective_periods AS qcfep
                      INNER JOIN quality_control_flags AS qcf ON qcf.id = qcfep.flag_id
                      INNER JOIN runs AS r ON qcf.run_number = r.run_number
                      INNER JOIN data_pass_quality_control_flag AS dpqcf ON dpqcf.quality_control_flag_id = qcf.id
                 -- Only flags of detectors which are defined in global_aggregated_quality_detectors
                 -- should be taken into account for calculation of gaq_effective_periods
                      INNER JOIN global_aggregated_quality_detectors AS gaqd
                                 ON gaqd.data_pass_id = dpqcf.data_pass_id
                                     AND gaqd.run_number = qcf.run_number
                                     AND gaqd.detector_id = qcf.detector_id)
            ORDER BY ordering_timestamp) AS ap
      WINDOW w AS (
          PARTITION BY data_pass_id,
              run_number
          ORDER BY ap.ordering_timestamp
          )) AS gaq_periods_with_last_nullish_row
WHERE gaq_periods_with_last_nullish_row.from_ordering_timestamp IS NOT NULL); -- There is one less interval than there is timestamps
`;

const CREATE_QC_FLAG_SIGNIFICANCE_AGGREGATE_FUNCTION = `
CREATE OR REPLACE AGGREGATE FUNCTION qc_flag_significance(row_bad TINYINT(1), row_mc_reproducible TINYINT(1)) RETURNS ENUM ('bad', 'mcr', 'good')
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

const CREATE_QC_FLAG_SIGNIFICANCE_COVERAGE_AGGREGATE_FUNCTION = `
CREATE OR REPLACE AGGREGATE FUNCTION qc_flag_significance_coverage(
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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.sequelize.query(CREATE_GAQ_PERIODS_VIEW);
        await queryInterface.sequelize.query(CREATE_QC_FLAG_SIGNIFICANCE_AGGREGATE_FUNCTION);
        await queryInterface.sequelize.query(CREATE_QC_FLAG_SIGNIFICANCE_COVERAGE_AGGREGATE_FUNCTION);
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
    }),
};
