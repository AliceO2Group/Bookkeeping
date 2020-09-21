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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('flps', [
        {
            id: 1,
            name: 'FLP-TPC-1',
            hostname: 'someserver.cern.ch',
            nTimeframes: 50,
            bytesProcessed: 1024,
            bytesEquipmentReadOut: 16,
            bytesRecordingReadOut: 40,
            bytesFairMQReadOut: 60
        },
        {
            id: 2,
            name: 'FLP-TPC-2',
            hostname: 'someserver.cern.ch',
            nTimeframes: 50,
            bytesProcessed: 1024,
            bytesEquipmentReadOut: 56,
            bytesRecordingReadOut: 80,
            bytesFairMQReadOut: 30
        },
        {
            id: 3,
            name: 'FLP-TPC-3',
            hostname: 'someserver.cern.ch',
            nTimeframes: 50,
            bytesProcessed: 1024,
            bytesEquipmentReadOut: 76,
            bytesRecordingReadOut: 50,
            bytesFairMQReadOut: 20
        },
        {
            id: 4,
            name: 'FLP-TPC-4',
            hostname: 'someserver.cern.ch',
            nTimeframes: 50,
            bytesProcessed: 1024,
            bytesEquipmentReadOut: 96,
            bytesRecordingReadOut: 10,
            bytesFairMQReadOut: 90
        },
        {
            id: 5,
            name: 'FLP-TPC-5',
            hostname: 'someserver.cern.ch',
            nTimeframes: 50,
            bytesProcessed: 1024,
            bytesEquipmentReadOut: 16,
            bytesRecordingReadOut: 90,
            bytesFairMQReadOut: 15
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('flps', null, {}),
};
