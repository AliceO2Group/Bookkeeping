/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

module.exports = {
    up: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('log_runs', [
                    {
                        log_id: 1,
                        run_id: 1,
                    },
                    {
                        log_id: 2,
                        run_id: 1,
                    },
                    {
                        log_id: 2,
                        run_id: 2,
                    },
                    {
                        log_id: 3,
                        run_id: 1,
                    },
                    {
                        log_id: 3,
                        run_id: 3,
                    },
                    {
                        log_id: 4,
                        run_id: 1,
                    },
                    {
                        log_id: 4,
                        run_id: 2,
                    },
                    {
                        log_id: 4,
                        run_id: 6,
                    },
                    {
                        log_id: 119,
                        run_id: 2,
                    },
                    {
                        log_id: 119,
                        run_id: 3,
                    },
                    {
                        log_id: 119,
                        run_id: 4,
                    },
                    {
                        log_id: 119,
                        run_id: 5,
                    },
                    {
                        log_id: 119,
                        run_id: 6,
                    },
                    {
                        log_id: 119,
                        run_id: 7,
                    },
                    {
                        log_id: 119,
                        run_id: 8,
                    },
                    {
                        log_id: 119,
                        run_id: 9,
                    },
                    {
                        log_id: 119,
                        run_id: 10,
                    },
                    {
                        log_id: 119,
                        run_id: 11,
                    },
                    {
                        log_id: 119,
                        run_id: 12,
                    },
                    {
                        log_id: 119,
                        run_id: 13,
                    },
                    {
                        log_id: 119,
                        run_id: 14,
                    },
                    {
                        log_id: 119,
                        run_id: 15,
                    },
                    {
                        log_id: 119,
                        run_id: 16,
                    },
                    {
                        log_id: 119,
                        run_id: 17,
                    },
                    {
                        log_id: 119,
                        run_id: 18,
                    },
                    {
                        log_id: 119,
                        run_id: 19,
                    },
                    {
                        log_id: 119,
                        run_id: 20,
                    },
                    {
                        log_id: 119,
                        run_id: 21,
                    },
                    {
                        log_id: 119,
                        run_id: 22,
                    },
                ], { transaction }),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_runs', null, { transaction })])),
};
