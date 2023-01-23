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
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('eor_reasons', [
                    {
                        description: 'Some Reason other than selected',
                        last_edited_name: 'Anonymous',
                        run_id: 1,
                        reason_type_id: 1,
                        created_at: new Date('2022-08-09'),
                        updated_at: new Date('2022-08-10 15:00:00'),
                    },
                    {
                        description: 'Some Reason other than selected plus one',
                        last_edited_name: 'Anonymous',
                        reason_type_id: 2,
                        run_id: 1,
                        created_at: new Date('2022-08-09'),
                        updated_at: new Date('2022-08-10 05:00:00'),
                    },
                    {
                        last_edited_name: 'Anonymous',
                        reason_type_id: 3,
                        run_id: 2,
                        created_at: new Date('2021-08-09'),
                        updated_at: new Date('2021-08-10 15:00:00'),
                    },
                    {
                        last_edited_name: 'Anonymous',
                        reason_type_id: 1,
                        run_id: 2,
                        created_at: new Date('2021-07-09'),
                        updated_at: new Date('2021-07-10 15:00:00'),
                    },
                    {
                        reason_type_id: 2,
                        run_id: 3,
                        created_at: new Date('2020-08-09'),
                        updated_at: new Date('2020-08-10 15:00:00'),
                    },
                ], { transaction }),
            ])),
    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('eor_reasons', null, { transaction })])),
};
