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
        /**
         * Set GAQ detectors for run with given pdp_beam_type
         *
         * @param {string} beamType one of runs bpb_beam_types
         * @param {string[]} detectorsNames detector names
         * @return {Promise<void>} resolved once GAQ detectors are inserted
         */
        const setDefaultGaqDetectorsForRunsWithGivenPdpBeamType = (beamType, detectorsNames) =>
            queryInterface.sequelize.query(`
                INSERT INTO global_aggregated_quality_detectors(data_pass_id, run_number, detector_id)
                SELECT dpr.data_pass_id, r.run_number, d.id
                    FROM data_passes_runs AS dpr
                    INNER JOIN runs AS r
                        ON r.run_number = dpr.run_number
                        AND r.pdp_beam_type = '${beamType}'
                    INNER JOIN run_detectors AS rd
                        ON rd.run_number = r.run_number
                    INNER JOIN detectors AS d
                        ON d.id = rd.detector_id
                        AND d.name IN (${detectorsNames.map((name) => `'${name}'`).join(',')})
            `, { transaction });

        await setDefaultGaqDetectorsForRunsWithGivenPdpBeamType('pp', ['TPC', 'ITS', 'FT0']);
        await setDefaultGaqDetectorsForRunsWithGivenPdpBeamType('pp', ['TPC', 'ITS', 'FT0', 'ZDC']);
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.bulkDelete('global_aggregated_quality_detectors', null, { transaction });
    }),
};
