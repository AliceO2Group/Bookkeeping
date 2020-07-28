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
            id: 1,
            run_number: 1,
            time_o2_start: '2019-08-08 13:00:00',
            time_o2_end: '2019-08-08 13:00:00',
            time_trg_start: '2019-08-08 13:00:00',
            time_trg_end: '2019-08-08 13:00:00',
            activity_id: '1234567890',
            run_type: 'technical',
            run_quality: 'good',
            n_detectors: 3,
            n_flps: 10,
            n_epns: 10,
            n_subtimeframes: 10,
            bytes_read_out: 1024,
        },
        {
            id: 2,
            run_number: 2,
            time_o2_start: '2019-08-08 13:00:00',
            time_o2_end: '2019-08-08 13:00:00',
            time_trg_start: '2019-08-08 13:00:00',
            time_trg_end: '2019-08-08 13:00:00',
            activity_id: '1234567890',
            run_type: 'technical',
            run_quality: 'bad',
            n_detectors: 3,
            n_flps: 10,
            n_epns: 10,
            n_subtimeframes: 10,
            bytes_read_out: 1024,
        },
        {
            id: 3,
            run_number: 3,
            time_o2_start: '2019-08-08 13:00:00',
            time_o2_end: '2019-08-08 13:00:00',
            time_trg_start: '2019-08-08 13:00:00',
            time_trg_end: '2019-08-08 13:00:00',
            activity_id: '1234567890',
            run_type: 'physics',
            run_quality: 'unknown',
            n_detectors: 3,
            n_flps: 10,
            n_epns: 10,
            n_subtimeframes: 10,
            bytes_read_out: 1024,
        },
        {
            id: 4,
            run_number: 4,
            time_o2_start: '2019-08-08 13:00:00',
            time_o2_end: '2019-08-08 13:00:00',
            time_trg_start: '2019-08-08 13:00:00',
            time_trg_end: '2019-08-08 13:00:00',
            activity_id: '1234567890',
            run_type: 'physics',
            run_quality: 'good',
            n_detectors: 3,
            n_flps: 10,
            n_epns: 10,
            n_subtimeframes: 10,
            bytes_read_out: 1024,
        },
        {
            id: 5,
            run_number: 5,
            time_o2_start: '2019-08-08 13:00:00',
            time_o2_end: '2019-08-08 13:00:00',
            time_trg_start: '2019-08-08 13:00:00',
            time_trg_end: '2019-08-08 13:00:00',
            activity_id: '1234567890',
            run_type: 'cosmics',
            run_quality: 'unknown',
            n_detectors: 3,
            n_flps: 10,
            n_epns: 10,
            n_subtimeframes: 10,
            bytes_read_out: 1024,
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('runs', null, {}),
};
