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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('runs', [
        {
            runNumber: '1',
            time02Start: '13:00:00',
            timeO2End: '13:01:30',
            timeTrgStart: '13:00:01',
            timeTrgEnd: '13:01:31',
            activityId: '1234567890',
            runType: 'technical',
            runQuality: 'good',
            nDetectors: '3',
            nFlps: '10',
            nEpns: '10',
            nSubtimeframes: '10',
            bytesReadOut: '1024',
            bytesTimeframe_builder: '1024',
        },
        {
            runNumber: '2',
            time02Start: '14:00:00',
            timeO2End: '14:01:30',
            timeTrgStart: '14:00:01',
            timeTrgEnd: '14:01:31',
            activityId: '1234567890',
            runType: 'technical',
            runQuality: 'bad',
            nDetectors: '3',
            nFlps: '10',
            nEpns: '10',
            nSubtimeframes: '10',
            bytesReadOut: '1024',
            bytesTimeframe_builder: '1024',
        },
        {
            runNumber: '3',
            time02Start: '15:00:00',
            timeO2End: '15:01:30',
            timeTrgStart: '15:00:01',
            timeTrgEnd: '15:01:31',
            activityId: '1234567890',
            runType: 'physics',
            runQuality: 'unknown',
            nDetectors: '3',
            nFlps: '10',
            nEpns: '10',
            nSubtimeframes: '10',
            bytesReadOut: '1024',
            bytesTimeframe_builder: '1024',
        },
        {
            runNumber: '4',
            time02Start: '16:00:00',
            timeO2End: '16:01:30',
            timeTrgStart: '16:00:01',
            timeTrgEnd: '16:01:31',
            activityId: '1234567890',
            runType: 'physics',
            runQuality: 'good',
            nDetectors: '3',
            nFlps: '10',
            nEpns: '10',
            nSubtimeframes: '10',
            bytesReadOut: '1024',
            bytesTimeframe_builder: '1024',

        },
        {
            runNumber: '5',
            time02Start: '17:00:00',
            timeO2End: '17:01:30',
            timeTrgStart: '17:00:01',
            timeTrgEnd: '17:01:31',
            activityId: '1234567890',
            runType: 'cosmics',
            runQuality: 'unknown',
            nDetectors: '3',
            nFlps: '10',
            nEpns: '10',
            nSubtimeframes: '10',
            bytesReadOut: '1024',
            bytesTimeframe_builder: '1024',
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('runs', null, {}),
};
