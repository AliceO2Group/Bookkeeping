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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('data_passes', [
                    {
                        id: 1,
                        name: 'LHC22b_apass1',
                        description: 'Some random desc',
                        reconstructed_events_count: 50948694,
                        output_size: 56875682112600,
                        last_run_number: 108,
                        lhc_period_id: 2,
                    },
                    {
                        id: 2,
                        name: 'LHC22b_apass2',
                        description: 'Some random desc',
                        reconstructed_events_count: 50848604,
                        output_size: 55765671112610,
                        last_run_number: 55,
                        lhc_period_id: 2,
                    },
                    {
                        id: 3,
                        name: 'LHC22a_apass1',
                        description: 'Some random desc for apass 1',
                        reconstructed_events_count: 50848111,
                        output_size: 55761110122610,
                        last_run_number: 105,
                        lhc_period_id: 1,
                    },
                ], { transaction }),

                queryInterface.bulkInsert('data_passes_runs', [
                    { data_pass_id: 1, run_number: 106 },
                    { data_pass_id: 1, run_number: 107 },
                    { data_pass_id: 1, run_number: 108 },
                    { data_pass_id: 2, run_number: 1 },
                    { data_pass_id: 2, run_number: 2 },
                    { data_pass_id: 2, run_number: 55 },
                    { data_pass_id: 3, run_number: 49 },
                    { data_pass_id: 3, run_number: 54 },
                    { data_pass_id: 3, run_number: 56 },
                    { data_pass_id: 3, run_number: 105 },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_lhc_fills', null, { transaction })])),
};
