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

'use strict';

const ADD_RUN_START_AND_STOP = `
    ALTER TABLE runs
        ADD COLUMN time_start DATETIME AS (COALESCE(time_trg_start, time_trg_end)) VIRTUAL AFTER time_trg_end,
        ADD COLUMN time_end   DATETIME AS (COALESCE(time_trg_end, time_o2_end)) VIRTUAL AFTER time_start;
`;

const ADD_STABLE_BEAMS_RUNS_VIEW = `
CREATE OR REPLACE VIEW stable_beam_runs AS
SELECT r.run_number,
       lf.fill_number,
       lf.stable_beams_duration                                  sb_duration,
       lf.stable_beams_start                                     sb_start,
       lf.stable_beams_end                                       sb_end,
       GREATEST(r.time_start, lf.stable_beams_start)             sb_run_start,
       LEAST(r.time_end, lf.stable_beams_end)                    sb_run_end,
       TO_SECONDS(LEAST(r.time_end, lf.stable_beams_end)) -
       TO_SECONDS(GREATEST(r.time_start, lf.stable_beams_start)) sb_run_duration
FROM runs r
         INNER JOIN lhc_fills lf ON r.fill_number = lf.fill_number
WHERE lf.stable_beams_end IS NOT NULL
  AND lf.stable_beams_start IS NOT NULL
  AND r.time_start IS NOT NULL
  AND r.time_end IS NOT NULL
  AND lf.stable_beams_end > r.time_start
  AND r.time_end > lf.stable_beams_start;
`;

const ADD_FILL_STATISTICS_VIEW = `
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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(ADD_RUN_START_AND_STOP, { transaction });
        await queryInterface.sequelize.query(ADD_STABLE_BEAMS_RUNS_VIEW, { transaction });
        await queryInterface.sequelize.query(ADD_FILL_STATISTICS_VIEW, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query('DROP VIEW stable_beam_runs', { transaction });
        await queryInterface.sequelize.query('DROP VIEW fill_statistics', { transaction });
        await queryInterface.removeColumn('runs', 'time_start', { transaction });
        await queryInterface.removeColumn('runs', 'time_end', { transaction });
    }),
};
