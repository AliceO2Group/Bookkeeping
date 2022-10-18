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
                queryInterface.bulkInsert(
                    'run_detectors',
                    [
                        {
                            run_number: 1,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 2,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 3,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 4,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 5,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 6,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 7,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 8,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 9,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 10,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 11,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 12,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 13,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 14,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 15,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 16,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 17,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 18,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 19,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 20,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 21,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 22,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 23,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 24,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 25,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 26,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 27,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 28,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 29,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 30,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 31,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 32,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 33,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 34,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 35,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 36,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 37,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 38,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 39,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 40,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 41,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 42,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 43,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 44,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 45,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 46,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 47,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 48,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 49,
                            detector_id: 7,
                            quality: 'good',
                        },
                        {
                            run_number: 49,
                            detector_id: 4,
                            quality: 'good',
                        },
                        {
                            run_number: 50,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 51,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 52,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 53,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 54,
                            detector_id: 7,
                            quality: 'good',
                        },
                        {
                            run_number: 55,
                            detector_id: 4,
                            quality: 'good',
                        },
                        {
                            run_number: 56,
                            detector_id: 7,
                            quality: 'good',
                        },
                        {
                            run_number: 56,
                            detector_id: 4,
                            quality: 'good',
                        },
                        {
                            run_number: 57,
                            detector_id: 7,
                            quality: 'good',
                        },
                        {
                            run_number: 57,
                            detector_id: 4,
                            quality: 'good',
                        },
                        {
                            run_number: 58,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 59,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 60,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 61,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 62,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 63,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 64,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 65,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 66,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 67,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 68,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 69,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 70,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 71,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 72,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 73,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 74,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 75,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 76,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 77,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 78,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 79,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 80,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 81,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 82,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 83,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 84,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 85,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 86,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 87,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 88,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 89,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 90,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 91,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 92,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 93,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 94,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 95,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 96,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 97,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 98,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 99,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 100,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 101,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 102,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 103,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 104,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 105,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 17,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 1,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 18,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 2,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 19,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 6,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 7,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 8,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 9,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 10,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 11,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 12,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 13,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 14,
                            quality: 'good',
                        },
                        {
                            run_number: 106,
                            detector_id: 16,
                            quality: 'good',
                        },
                    ],
                    { transaction },
                ),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('run_detectors', null, { transaction })])),
};
