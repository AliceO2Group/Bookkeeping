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
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('quality_control_flag_types', null, { transaction })])),
};
