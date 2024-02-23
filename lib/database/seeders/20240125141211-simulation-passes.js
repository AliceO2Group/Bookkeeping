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
                queryInterface.bulkInsert('simulation_passes', [
                    {
                        id: 1,
                        name: 'LHC23k6c',
                        jira_id: 'SIMTICKET-1',
                        description: 'Some Random general purpose for LHC23k6c',
                        pwg: 'PWGX2',
                        requested_events_count: 1345555,
                        generated_events_count: 4316450,
                        output_size: 14013600611699,
                    },
                    {
                        id: 2,
                        name: 'LHC23k6b',
                        jira_id: 'SIMTICKET-2',
                        description: 'Some Random general purpose for LHC23k6b',
                        pwg: 'PWGX1',
                        requested_events_count: 2345555,
                        generated_events_count: 54800,
                        output_size: 157000310748,
                    },
                    {
                        id: 3,
                        name: 'LHC23k6a',
                        jira_id: 'SIMTICKET-3',
                        description: 'Some Random general purpose for LHC23k6a',
                        pwg: 'PWGX3',
                        requested_events_count: 2245555,
                        generated_events_count: 53800,
                        output_size: 147000310748,
                    },
                ], { transaction }),

                queryInterface.bulkInsert('simulation_pass_data_pass_anchors', [
                    { data_pass_id: 1, simulation_pass_id: 1 },
                    { data_pass_id: 2, simulation_pass_id: 1 },

                    { data_pass_id: 3, simulation_pass_id: 2 },
                    { data_pass_id: 3, simulation_pass_id: 3 },
                ], { transaction }),

                queryInterface.bulkInsert('simulation_passes_runs', [
                    { simulation_pass_id: 1, run_number: 106 },
                    { simulation_pass_id: 1, run_number: 107 },

                    { simulation_pass_id: 2, run_number: 49 },
                    { simulation_pass_id: 2, run_number: 54 },
                    { simulation_pass_id: 2, run_number: 56 },

                    { simulation_pass_id: 3, run_number: 49 },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkDelete('simulation_passes_runs', null, { transaction }),
                queryInterface.bulkDelete('simulation_pass_data_pass_anchors', null, { transaction }),
                queryInterface.bulkDelete('simulation_passes', null, { transaction }),

            ])),
};
