'use strict';

const ROLLBACK_FILL_STATISTICS_TO_PREVIOUS = `
CREATE OR REPLACE VIEW fill_statistics AS
SELECT sbr.fill_number,
       SUM(sbr.sb_run_duration)                                                         runs_coverage,
       SUM(sbr.sb_run_duration) / sbr.sb_duration                                       efficiency,
       TO_SECONDS(MIN(sbr.sb_run_start)) - TO_SECONDS(sbr.sb_start)                     time_loss_at_start,
       (TO_SECONDS(MIN(sbr.sb_run_start)) - TO_SECONDS(sbr.sb_start)) / sbr.sb_duration efficiency_loss_at_start,
       TO_SECONDS(sbr.sb_end) - TO_SECONDS(MAX(sbr.sb_run_end))                         time_loss_at_end,
       (TO_SECONDS(sbr.sb_end) - TO_SECONDS(MAX(sbr.sb_run_end))) / sbr.sb_duration     efficiency_loss_at_end,
       AVG(sbr.sb_run_duration)                                                         mean_run_duration,
       SUM(r.ctf_file_size)                                                             total_ctf_file_size,
       SUM(r.tf_file_size)                                                              total_tf_file_size
FROM stable_beam_runs sbr
         INNER JOIN runs r ON sbr.run_number = r.run_number
WHERE r.definition = 'PHYSICS'
  AND r.run_quality = 'good'
GROUP BY sbr.fill_number;
`;

const UPDATE_FILL_STATISTICS_VIEW = `
CREATE OR REPLACE VIEW fill_statistics AS
SELECT lf.fill_number,
       SUM(sbr.sb_run_duration)                                                   runs_coverage,
       SUM(COALESCE(sbr.sb_run_duration / sbr.sb_duration, 0))                    efficiency,
       COALESCE(
                   TO_SECONDS(MIN(sbr.sb_run_start)) - TO_SECONDS(MAX(sbr.sb_start)),
                   0
           )                                                                      time_loss_at_start,
       COALESCE(
                   (TO_SECONDS(MIN(sbr.sb_run_start)) - TO_SECONDS(MAX(sbr.sb_start))) / MAX(sbr.sb_duration),
                   0
           )                                                                      efficiency_loss_at_start,
       COALESCE(TO_SECONDS(MIN(sbr.sb_end)) - TO_SECONDS(MAX(sbr.sb_run_end)), 0) time_loss_at_end,
       COALESCE(
                   (TO_SECONDS(MIN(sbr.sb_end)) - TO_SECONDS(MAX(sbr.sb_run_end))) / MAX(sbr.sb_duration),
                   0
           )                                                                      efficiency_loss_at_end,
       COALESCE(AVG(sbr.sb_run_duration), 0)                                      mean_run_duration,
       COALESCE(SUM(r.ctf_file_size), 0)                                          total_ctf_file_size,
       COALESCE(SUM(r.tf_file_size), 0)                                           total_tf_file_size
FROM lhc_fills lf
         LEFT JOIN runs r ON r.fill_number = lf.fill_number AND r.definition = 'PHYSICS' AND r.run_quality = 'good'
         LEFT JOIN stable_beam_runs sbr ON sbr.run_number = r.run_number
WHERE lf.stable_beams_start IS NOT NULL
GROUP BY lf.fill_number;
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(UPDATE_FILL_STATISTICS_VIEW, { transaction });
        await queryInterface.addIndex(
            'runs',
            {
                name: 'runs_fill_number_index',
                fields: ['fill_number'],
                transaction,
            },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(ROLLBACK_FILL_STATISTICS_TO_PREVIOUS, { transaction });
        await queryInterface.removeIndex('runs', 'runs_fill_number_index', { transaction });
    }),
};
