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
                queryInterface.bulkInsert('quality_control_flags', [

                    /** Flags for runNumber: 106, LHC22b_apass1, CPV */
                    {
                        id: 1,
                        from: '2019-08-08 22:43:20',
                        to: '2019-08-09 04:16:40',
                        comment: 'Some qc comment 1',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 11, // LimitedAcceptance
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:16',
                        updated_at: '2024-02-13 11:57:16',
                    },

                    {
                        id: 2,
                        from: '2019-08-09 05:40:00',
                        to: '2019-08-09 07:03:20',
                        comment: 'Some qc comment 2',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 11, // LimitedAcceptance
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:17',
                        updated_at: '2024-02-13 11:57:17',
                    },

                    {
                        id: 3,
                        from: '2019-08-09 08:26:40',
                        to: '2019-08-09 09:50:00',
                        comment: 'Some qc comment 3',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:18',
                        updated_at: '2024-02-13 11:57:18',
                    },

                    /** Flags for runNumber: 1, LHC22b_apass2, CPV */
                    {
                        id: 4,
                        from: '2022-03-22 04:46:40',
                        to: '2022-03-22 04:46:40',
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 1,
                        dpl_detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:19',
                        updated_at: '2024-02-13 11:57:19',
                    },

                    {
                        id: 5,
                        from: '2019-08-08 13:46:40',
                        to: '2019-08-09 07:50:00',
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:20',
                        updated_at: '2024-02-13 11:57:20',
                    },
                ], { transaction }),

                queryInterface.bulkInsert('data_pass_quality_control_flag', [
                    {
                        data_pass_id: 1, // LHC22b_apass1
                        quality_control_flag_id: 1,
                    },
                    {
                        data_pass_id: 1, // LHC22b_apass1
                        quality_control_flag_id: 2,
                    },
                    {
                        data_pass_id: 1, // LHC22b_apass1
                        quality_control_flag_id: 3,
                    },

                    {
                        data_pass_id: 2, // LHC22b_apass2
                        quality_control_flag_id: 4,
                    },
                ], { transaction }),

                queryInterface.bulkInsert('simulation_pass_quality_control_flag', [
                    {
                        simulation_pass_id: 1, // LHC23k6c
                        quality_control_flag_id: 5,
                    },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkDelete('data_pass_quality_control_flag', null, { transaction }),
                queryInterface.bulkDelete('simulation_pass_quality_control_flag', null, { transaction }),
                queryInterface.bulkDelete('quality_control_flags', null, { transaction }),
            ])),
};
