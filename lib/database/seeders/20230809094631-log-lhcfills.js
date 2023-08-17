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
                queryInterface.bulkInsert('log_lhc_fills', [
                    {
                        logId: 1,
                        fillNumber: 5,
                    },
                    {
                        logId: 1,
                        fillNumber: 6,
                    },
                    {
                        logId: 2,
                        fillNumber: 6,
                    },
                    {
                        logId: 3,
                        fillNumber: 5,
                    },
                    {
                        logId: 3,
                        fillNumber: 4,
                    },
                    {
                        logId: 4,
                        fillNumber: 5,
                    },
                    {
                        logId: 4,
                        fillNumber: 6,
                    },
                    {
                        logId: 4,
                        fillNumber: 3,
                    },
                    {
                        logId: 119,
                        fillNumber: 6,
                    },
                    {
                        logId: 119,
                        fillNumber: 4,
                    },
                    {
                        logId: 119,
                        fillNumber: 2,
                    },
                    {
                        logId: 119,
                        fillNumber: 1,
                    },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_lhc_fills', null, { transaction })])),
};
