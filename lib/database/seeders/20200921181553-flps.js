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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('flp_roles', [
        {
            id: 1,
            name: 'FLP-TPC-1',
            hostname: 'someserver.cern.ch',
            n_timeframes: 50,
            bytes_processed: 1024,
            bytes_equipment_read_out: 16,
            bytes_recording_read_out: 40,
            bytes_fair_m_q_read_out: 60,
        },
        {
            id: 2,
            name: 'FLP-TPC-2',
            hostname: 'someserver.cern.ch',
            n_timeframes: 50,
            bytes_processed: 1024,
            bytes_equipment_read_out: 56,
            bytes_recording_read_out: 80,
            bytes_fair_m_q_read_out: 30,
        },
        {
            id: 3,
            name: 'FLP-TPC-3',
            hostname: 'someserver.cern.ch',
            n_timeframes: 50,
            bytes_processed: 1024,
            bytes_equipment_read_out: 76,
            bytes_recording_read_out: 50,
            bytes_fair_m_q_read_out: 20,
        },
        {
            id: 4,
            name: 'FLP-TPC-4',
            hostname: 'someserver.cern.ch',
            n_timeframes: 50,
            bytes_processed: 1024,
            bytes_equipment_read_out: 96,
            bytes_recording_read_out: 10,
            bytes_fair_m_q_read_out: 90,
        },
        {
            id: 5,
            name: 'FLP-TPC-5',
            hostname: 'someserver.cern.ch',
            n_timeframes: 50,
            bytes_processed: 1024,
            bytes_equipment_read_out: 16,
            bytes_recording_read_out: 90,
            bytes_fair_m_q_read_out: 15,
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('flp_roles', null, {}),
};
