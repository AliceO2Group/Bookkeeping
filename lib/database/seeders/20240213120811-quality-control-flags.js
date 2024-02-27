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
                queryInterface.bulkInsert('quality_control_flag_reasons', [
                    {
                        id: 2,
                        name: 'UnknownQuality',
                        method: 'Unknown Quality',
                        bad: true,
                        obsolate: true,
                    },
                    {
                        id: 3,
                        name: 'CertifiedByExpert',
                        method: 'Certified by Expert',
                        bad: false,
                        obsolate: true,
                    },
                    {
                        id: 11,
                        name: 'LimitedAcceptance',
                        method: 'Limited acceptance',
                        bad: true,
                        obsolate: true,
                    },
                    {
                        id: 12,
                        name: 'BadPID',
                        method: 'Bad PID',
                        bad: true,
                        obsolate: true,
                    },
                    {
                        id: 13,
                        name: 'Bad',
                        method: 'Bad',
                        bad: true,
                        obsolate: false,
                    },

                ], { transaction }),

                queryInterface.bulkInsert('quality_control_flags', [

                    /** Flags for runNumber: 106, LHC22b_apass1, CPV */
                    { // Run trg time middle point: 1565314200, radius: 45000 seconds
                        id: 1,
                        time_start: new Date((1565314200 - 10000) * 1000),
                        time_end: new Date((1565314200 + 10000) * 1000),
                        comment: 'Some qc comment 1',
                        provenance: 'HUMAN',

                        // Associations
                        user_id: 1,
                        flag_reason_id: 11, // LimitedAcceptance
                        run_number: 106,
                        data_pass_id: 1, // LHC22b_apass1
                        detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    { // Run trg time middle point: 1565314200, radius: 45000 seconds
                        id: 2,
                        time_start: new Date((1565314200 + 15000) * 1000),
                        time_end: new Date((1565314200 + 20000) * 1000),
                        comment: 'Some qc comment 2',
                        provenance: 'HUMAN',

                        // Associations
                        user_id: 1,
                        flag_reason_id: 11, // LimitedAcceptance
                        run_number: 106,
                        data_pass_id: 1, // LHC22b_apass1
                        detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    { // Run trg time middle point: 1565314200, radius: 45000 seconds
                        id: 3,
                        time_start: new Date((1565314200 + 25000) * 1000),
                        time_end: new Date((1565314200 + 30000) * 1000),
                        comment: 'Some qc comment 3',
                        provenance: 'HUMAN',

                        // Associations
                        user_id: 1,
                        flag_reason_id: 13, // Bad
                        run_number: 106,
                        data_pass_id: 1, // LHC22b_apass1
                        detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },

                    /** Flags for runNumber: 1, LHC22b_apass2, CPV */
                    { // Run trg time middle point: 1647914400, radius: 46800 seconds
                        id: 4,
                        time_start: new Date((1647914400 + 10000) * 1000),
                        time_end: new Date((1647914400 + 10000) * 1000),
                        comment: 'Some qc comment 4',
                        provenance: 'HUMAN',

                        // Associations
                        user_id: 2,
                        flag_reason_id: 13, // Bad
                        run_number: 1,
                        data_pass_id: 2, // LHC22b_apass2
                        detector_id: 1, // CPV
                        created_at: new Date(1707825436000),
                    },
                ], { transaction }),

            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkDelete('quality_control_flags', null, { transaction }),
                queryInterface.bulkDelete('quality_control_flag_reasons', null, { transaction }),
            ])),
};
