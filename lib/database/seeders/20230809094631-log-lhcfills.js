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
                queryInterface.bulkInsert('log_lhcFills', [
                    {
                        logId: 1,
                        lhcFillNumber: 5,
                    },
                    {
                        logId: 1,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 2,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 3,
                        lhcFillNumber: 5,
                    },
                    {
                        logId: 3,
                        lhcFillNumber: 4,
                    },
                    {
                        logId: 4,
                        lhcFillNumber: 5,
                    },
                    {
                        logId: 4,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 4,
                        lhcFillNumber: 3,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 4,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 2,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 1,
                    },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_lhcFills', null, { transaction })])),
};
