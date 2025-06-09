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
                        monte_carlo_reproducible: false,
                    },
                    {
                        id: 3,
                        name: 'Good',
                        method: 'Good',
                        bad: false,
                        created_by_id: 1,
                        monte_carlo_reproducible: false,
                    },
                    {
                        id: 5,
                        name: 'Limited Acceptance MC Reproducible',
                        method: 'LimitedAcceptanceMCReproducible',
                        monte_carlo_reproducible: true,
                        bad: true,
                        color: '#FFFF00',
                        created_by_id: 1,
                    },
                    {
                        id: 11,
                        name: 'Limited acceptance',
                        method: 'LimitedAcceptance',
                        bad: true,
                        color: '#FFFF00',
                        created_by_id: 1,
                        monte_carlo_reproducible: false,
                    },
                    {
                        id: 12,
                        name: 'Bad PID',
                        method: 'BadPID',
                        bad: true,
                        created_by_id: 1,
                        monte_carlo_reproducible: false,
                    },
                    {
                        id: 13,
                        name: 'Bad',
                        method: 'Bad',
                        bad: true,
                        created_by_id: 1,
                        monte_carlo_reproducible: false,
                    },
                    {
                        id: 20,
                        name: 'Archived',
                        method: 'Archived',
                        bad: false,
                        created_by_id: 1,
                        archived_at: '2024-03-15 12:00:00',
                        monte_carlo_reproducible: false,
                    },

                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('quality_control_flag_types', null, { transaction })])),
};
