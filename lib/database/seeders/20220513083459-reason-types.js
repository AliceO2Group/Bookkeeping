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
                queryInterface.bulkInsert('reason_types', [
                    {
                        category: 'DETECTORS',
                        title: 'CPV',
                        created_at: new Date('2022-08-09'),
                        updated_at: new Date('2022-08-10 15:00:00'),
                    },
                    {
                        category: 'DETECTORS',
                        title: 'TPC',
                        created_at: new Date('2022-08-09'),
                        updated_at: new Date('2022-08-10 05:00:00'),
                    },
                    {
                        category: 'OTHER',
                        title: 'Some-other',
                        created_at: new Date('2021-08-09'),
                        updated_at: new Date('2021-08-10 15:00:00'),
                    },
                    {
                        category: 'OTHER',
                        title: '',
                        created_at: new Date('2021-07-09'),
                        updated_at: new Date('2021-07-10 15:00:00'),
                    },
                ], { transaction }),
            ])),
    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('reason_types', null, { transaction })])),
};
