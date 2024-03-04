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
                queryInterface.bulkInsert('quality_control_flag_types', [
                    {
                        id: 2,
                        name: 'UnknownQuality',
                        method: 'Unknown Quality',
                        bad: true,
                    },
                    {
                        id: 3,
                        name: 'CertifiedByExpert',
                        method: 'Certified by Expert',
                        bad: false,
                    },
                    {
                        id: 11,
                        name: 'LimitedAcceptance',
                        method: 'Limited acceptance',
                        bad: true,
                    },
                    {
                        id: 12,
                        name: 'BadPID',
                        method: 'Bad PID',
                        bad: true,
                    },
                    {
                        id: 13,
                        name: 'Bad',
                        method: 'Bad',
                        bad: true,
                    },

                ], { transaction }),

                queryInterface.bulkInsert('quality_control_flags', [

                    /** Flags for runNumber: 106, LHC22b_apass1, CPV */
                    { // Run trg time middle point: 1565314200, radius: 45000 seconds
                        id: 1,
                        from: new Date((1565314200 - 10000) * 1000),
                        to: new Date((1565314200 + 10000) * 1000),
                        comment: 'Some qc comment 1',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 11, // LimitedAcceptance
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    { // Run trg time middle point: 1565314200, radius: 45000 seconds
                        id: 2,
                        from: new Date((1565314200 + 15000) * 1000),
                        to: new Date((1565314200 + 20000) * 1000),
                        comment: 'Some qc comment 2',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 11, // LimitedAcceptance
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    { // Run trg time middle point: 1565314200, radius: 45000 seconds
                        id: 3,
                        from: new Date((1565314200 + 25000) * 1000),
                        to: new Date((1565314200 + 30000) * 1000),
                        comment: 'Some qc comment 3',

                        // Associations
                        created_by_id: 1,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    /** Flags for runNumber: 1, LHC22b_apass2, CPV */
                    { // Run trg time middle point: 1647914400, radius: 46800 seconds
                        id: 4,
                        from: new Date((1647914400 + 10000) * 1000),
                        to: new Date((1647914400 + 10000) * 1000),
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 1,
                        dpl_detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    { // Run trg time middle point: 1565307000, radius: 45000 seconds
                        id: 5,
                        from: new Date((1565307000 - 35000) * 1000),
                        to: new Date((1565307000 + 30000) * 1000),
                        comment: 'Some qc comment 4',

                        // Associations
                        created_by_id: 2,
                        flag_type_id: 13, // Bad
                        run_number: 106,
                        dpl_detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
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
                queryInterface.bulkDelete('quality_control_flag_types', null, { transaction }),
            ])),
};
