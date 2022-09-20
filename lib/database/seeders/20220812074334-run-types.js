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
                queryInterface.bulkInsert('run_types', [
                    {
                        id: 1,
                        name: 'NONE',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 2,
                        name: 'CALIBRATION_ITHR_TUNING',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 3,
                        name: 'CALIBRATION_VCASN_TUNING',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 4,
                        name: 'CALIBRATION_THR_SCAN',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 5,
                        name: 'CALIBRATION_DIGITAL_SCAN',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 6,
                        name: 'CALIBRATION_ANALOG_SCAN',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 7,
                        name: 'CALIBRATION_FHR',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 8,
                        name: 'CALIBRATION_ALPIDE_SCAN',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 9,
                        name: 'COSMICS',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 10,
                        name: 'LASER',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 11,
                        name: 'PEDESTAL',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 12,
                        name: 'PHYSICS',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 13,
                        name: 'PULSER',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 14,
                        name: 'TECHNICAL',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        id: 15,
                        name: 'SYNTHETIC',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                ], { transaction }),
            ])),
    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('run_types', null, { transaction })])),
};
