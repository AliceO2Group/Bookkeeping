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
                        deleted: false,
                        from: '2019-08-08 22:43:20',
                        to: '2019-08-09 04:16:40',
                        comment: 'Some qc comment 1',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 5, // LimitedAcceptance MC Reproducible
                        run_number: 106,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:16',
                        updated_at: '2024-02-13 11:57:16',
                    },

                    {
                        id: 2,
                        deleted: false,
                        from: '2019-08-09 05:40:00',
                        to: '2019-08-09 07:03:20',
                        comment: 'Some qc comment 2',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 11, // LimitedAcceptance
                        run_number: 106,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:17',
                        updated_at: '2024-02-13 11:57:17',
                    },

                    {
                        id: 3,
                        deleted: false,
                        from: '2019-08-09 08:26:40',
                        to: '2019-08-09 09:50:00',
                        comment: 'Some qc comment 3',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:18',
                        updated_at: '2024-02-13 11:57:18',
                    },

                    /** Flags for runNumber: 106, LHC22b_apass1, ZCD */
                    {
                        id: 7,
                        deleted: false,
                        from: null,
                        to: null,
                        comment: 'Some qc comment 7',
                        origin: 'qc_async/ZDC/AverageClusterSize',

                        // Associations
                        created_by_id: 3, // Anonymous
                        flag_type_id: 3, // Good
                        run_number: 106,
                        detector_id: 16, // ZDC
                        created_at: '2024-02-13 12:00:01',
                        updated_at: '2024-02-13 12:00:01',
                    },

                    /** Flags for runNumber: 107, LHC22b_apass1, CPV */
                    {
                        id: 201,
                        deleted: false,
                        from: null,
                        to: '2019-08-08 19:00:00',
                        comment: 'Some qc comment 1',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 5, // LimitedAcceptance MC Reproducible
                        run_number: 107,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:16',
                        updated_at: '2024-02-13 11:57:16',
                    },
                    {
                        id: 202,
                        deleted: false,
                        from: '2019-08-08 19:00:00',
                        to: null,
                        comment: 'Some qc comment 1',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 3, // Good
                        run_number: 107,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:16',
                        updated_at: '2024-02-13 11:57:16',
                    },

                    /** Flags for runNumber: 107, LHC22b_apass1, EMC */
                    {
                        id: 203,
                        deleted: false,
                        from: null,
                        to: null,
                        comment: 'Some qc comment 1',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 3, // Good
                        run_number: 107,
                        detector_id: 2, // EMC
                        created_at: '2024-02-13 11:57:16',
                        updated_at: '2024-02-13 11:57:16',
                    },

                    /** Flags for LHC22b_apass2, CPV */
                    {
                        id: 4,
                        deleted: false,
                        from: '2022-03-22 02:46:40',
                        to: '2022-03-22 04:46:40',
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 1,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:19',
                        updated_at: '2024-02-13 11:57:19',
                    },

                    {
                        id: 5,
                        deleted: false,
                        from: '2019-08-08 13:46:40',
                        to: '2019-08-09 07:50:00',
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:57:20',
                        updated_at: '2024-02-13 11:57:20',
                    },

                    {
                        id: 6,
                        deleted: false,
                        from: '2019-08-09 08:50:00',
                        to: null,
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:58:20',
                        updated_at: '2024-02-13 11:58:20',
                    },

                    {
                        id: 8,
                        deleted: false,
                        from: null,
                        to: null,
                        comment: 'Some qc comment 5',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 100,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:58:20',
                        updated_at: '2024-02-13 11:58:20',
                    },

                    {
                        id: 9,
                        deleted: false,
                        from: null,
                        to: null,
                        comment: 'Some qc comment 6',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 3, // Bad
                        run_number: 105,
                        detector_id: 1, // CPV
                        created_at: '2024-02-13 11:58:20',
                        updated_at: '2024-02-13 11:58:20',
                    },

                    /** Synchronous */

                    // Run : 56, FT0
                    {
                        id: 100,
                        deleted: false,
                        from: null,
                        to: '2019-08-08 20:50:00',
                        comment: 'first part good',

                        flag_type_id: 3, // Good
                        run_number: 56,
                        created_by_id: 2,
                        detector_id: 7, // FT0

                        created_at: '2024-08-12 12:00:00',
                        updated_at: '2024-08-12 12:00:00',
                    },
                    {
                        id: 101,
                        deleted: false,
                        from: '2019-08-08 20:50:00',
                        to: null,
                        comment: 'second part bad',

                        run_number: 56,
                        flag_type_id: 12, // Bad PID
                        created_by_id: 2,
                        detector_id: 7, // FT0

                        created_at: '2024-08-12 12:00:10',
                        updated_at: '2024-08-12 12:00:10',
                    },

                    // Run : 56, ITS
                    {
                        id: 102,
                        deleted: false,
                        from: null,
                        to: null,
                        comment: 'all good',

                        flag_type_id: 3, // Good
                        run_number: 56,
                        created_by_id: 2,
                        detector_id: 4, // ITS

                        created_at: '2024-08-12 12:00:20',
                        updated_at: '2024-08-12 12:00:20',
                    },
                ], { transaction }),

                queryInterface.bulkInsert('quality_control_flag_effective_periods', [
                    {
                        id: 1,
                        flag_id: 1,
                        from: '2019-08-08 22:43:20',
                        to: '2019-08-09 04:16:40',
                    },
                    {
                        id: 2,
                        flag_id: 2,
                        from: '2019-08-09 05:40:00',
                        to: '2019-08-09 07:03:20',
                    },
                    {
                        id: 3,
                        flag_id: 3,
                        from: '2019-08-09 08:26:40',
                        to: '2019-08-09 09:50:00',
                    },
                    {
                        id: 4,
                        flag_id: 4,
                        from: '2022-03-22 02:46:40',
                        to: '2022-03-22 04:46:40',
                    },
                    {
                        id: 5,
                        flag_id: 5,
                        from: '2019-08-08 13:46:40',
                        to: '2019-08-09 07:50:00',
                    },
                    {
                        id: 7,
                        flag_id: 7,
                        from: null,
                        to: null,
                    },

                    {
                        id: 8,
                        flag_id: 8,
                        from: null,
                        to: null,
                    },
                    {
                        id: 9,
                        flag_id: 9,
                        from: null,
                        to: null,
                    },

                    /** Synchronous */
                    // Run : 56, FT0
                    {
                        id: 100,
                        flag_id: 100,
                        from: null,
                        to: '2019-08-08 20:50:00',
                    },
                    {
                        id: 101,
                        flag_id: 101,
                        from: '2019-08-08 20:50:00',
                        to: null,
                    },

                    // Run : 56, ITS
                    {
                        id: 102,
                        flag_id: 102,
                        from: null,
                        to: null,
                    },

                    {
                        id: 201,
                        flag_id: 201,
                        from: null,
                        to: '2019-08-08 19:00:00',
                    },
                    {
                        id: 202,
                        flag_id: 202,
                        from: '2019-08-08 19:00:00',
                        to: null,
                    },
                    {
                        id: 203,
                        flag_id: 203,
                        from: null,
                        to: null,
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
                        data_pass_id: 1, // LHC22b_apass1
                        quality_control_flag_id: 7,
                    },

                    {
                        data_pass_id: 2, // LHC22b_apass2
                        quality_control_flag_id: 4,
                    },

                    {
                        data_pass_id: 4, // LHC22a_apass2
                        quality_control_flag_id: 8,
                    },
                    {
                        data_pass_id: 4, // LHC22a_apass2
                        quality_control_flag_id: 9,
                    },

                    {
                        data_pass_id: 1,
                        quality_control_flag_id: 201,
                    },
                    {
                        data_pass_id: 1,
                        quality_control_flag_id: 202,
                    },
                    {
                        data_pass_id: 1,
                        quality_control_flag_id: 203,
                    },
                ], { transaction }),

                queryInterface.bulkInsert('simulation_pass_quality_control_flag', [
                    {
                        simulation_pass_id: 1, // LHC23k6c
                        quality_control_flag_id: 5,
                    },
                    {
                        simulation_pass_id: 1, // LHC23k6c
                        quality_control_flag_id: 6,
                    },
                ], { transaction }),

                queryInterface.bulkInsert('quality_control_flag_verifications', [
                    {
                        id: 1,
                        comment: 'FLAG IS OK',
                        flag_id: 4,
                        created_by_id: 1,

                        created_at: '2024-02-13 12:57:19',
                        updated_at: '2024-02-13 12:57:19',
                    },

                    {
                        id: 2,
                        flag_id: 100,
                        comment: 'good',
                        created_by_id: 1,

                        created_at: '2024-08-12 12:00:00',
                        updated_at: '2024-08-12 12:00:00',
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
