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
'use strict';

module.exports = {
    up: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('run_tags', [
                    {
                        run_id: 106,
                        tag_id: 1,
                    },
                    {
                        run_id: 106,
                        tag_id: 2,
                    },
                    {
                        run_id: 106,
                        tag_id: 3,
                    },
                    {
                        run_id: 106,
                        tag_id: 4,
                    },
                    {
                        run_id: 106,
                        tag_id: 5,
                    },
                    {
                        run_id: 106,
                        tag_id: 6,
                    },
                    {
                        run_id: 106,
                        tag_id: 8,
                    },
                    {
                        run_id: 2,
                        tag_id: 50,
                    },
                ], { transaction }),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('run_tags', null, { transaction })])),
};
