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
                queryInterface.bulkInsert('detectors', [
                    {
                        id: 1,
                        name: 'CPV',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 2,
                        name: 'EMC',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 3,
                        name: 'FDD',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 4,
                        name: 'FT0',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 5,
                        name: 'FV0',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 6,
                        name: 'HMP',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 7,
                        name: 'ITS',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 8,
                        name: 'MCH',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 9,
                        name: 'MFT',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 10,
                        name: 'MID',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 11,
                        name: 'PHS',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 12,
                        name: 'TOF',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 13,
                        name: 'TPC',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 14,
                        name: 'TRD',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 15,
                        name: 'TST',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 16,
                        name: 'ZDC',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                ], { transaction }),
            ])),
    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkDelete(
                    'detectors',
                    null,
                    { transaction },
                ),
            ])),
};
