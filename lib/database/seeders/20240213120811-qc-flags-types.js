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
                        name: 'Unknown Quality',
                        method: 'UnknownQuality',
                        bad: true,
                        created_by_id: 1,
                    },
                    {
                        id: 3,
                        name: 'Certified by Expert',
                        method: 'CertifiedByExpert',
                        bad: false,
                        created_by_id: 1,
                    },
                    {
                        id: 11,
                        name: 'Limited acceptance',
                        method: 'LimitedAcceptance',
                        bad: true,
                        color: '#FFFF00',
                        created_by_id: 1,
                    },
                    {
                        id: 12,
                        name: 'Bad PID',
                        method: 'BadPID',
                        bad: true,
                        created_by_id: 1,
                    },
                    {
                        id: 13,
                        name: 'Bad',
                        method: 'Bad',
                        bad: true,
                        created_by_id: 1,
                    },
                    {
                        id: 20,
                        name: 'Archived',
                        method: 'Archived',
                        bad: false,
                        created_by_id: 1,
                        archived_at: '2024-03-15 12:00:00',
                    },

                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('quality_control_flag_types', null, { transaction })])),
};
