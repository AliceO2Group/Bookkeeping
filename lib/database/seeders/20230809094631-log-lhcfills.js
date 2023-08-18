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
                        log_id: 1,
                        fill_number: 5,
                    },
                    {
                        log_id: 1,
                        fill_number: 6,
                    },
                    {
                        log_id: 2,
                        fill_number: 6,
                    },
                    {
                        log_id: 3,
                        fill_number: 5,
                    },
                    {
                        log_id: 3,
                        fill_number: 4,
                    },
                    {
                        log_id: 4,
                        fill_number: 5,
                    },
                    {
                        log_id: 4,
                        fill_number: 6,
                    },
                    {
                        log_id: 4,
                        fill_number: 3,
                    },
                    {
                        log_id: 119,
                        fill_number: 6,
                    },
                    {
                        log_id: 119,
                        fill_number: 4,
                    },
                    {
                        log_id: 119,
                        fill_number: 2,
                    },
                    {
                        log_id: 119,
                        fill_number: 1,
                    },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_lhc_fills', null, { transaction })])),
};
