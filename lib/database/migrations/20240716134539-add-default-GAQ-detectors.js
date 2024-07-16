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

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(`
            INSERT INTO global_aggregated_quality_detectors(data_pass_id, run_number, dpl_detector_id)
            SELECT dpr.data_pass_id, r.run_number, dpl.id
                FROM data_passes_runs AS dpr
                INNER JOIN runs AS r
                    ON r.run_number = dpr.run_number
                    AND r.pdp_beam_type = 'pp'
                INNER JOIN run_detectors AS rd
                    ON rd.run_number = r.run_number
                INNER JOIN detectors AS d
                    ON d.id = rd.detector_id
                INNER JOIN dpl_detectors AS dpl
                    ON dpl.name = d.name
                    AND dpl.name IN ('TPC', 'ITS', 'FT0')
        `, { transaction });

        await queryInterface.sequelize.query(`
            INSERT INTO global_aggregated_quality_detectors(data_pass_id, run_number, dpl_detector_id)
            SELECT dpr.data_pass_id, r.run_number, dpl.id
                FROM data_passes_runs AS dpr
                INNER JOIN runs AS r
                    ON r.run_number = dpr.run_number
                    AND r.pdp_beam_type = 'PbPb'
                INNER JOIN run_detectors AS rd
                    ON rd.run_number = r.run_number
                INNER JOIN detectors AS d
                    ON d.id = rd.detector_id
                INNER JOIN dpl_detectors AS dpl
                    ON dpl.name = d.name
                    AND dpl.name IN ('TPC', 'ITS', 'FT0', 'ZDC')
        `, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('global_aggregated_quality_detectors', { transaction });
    }),
};
