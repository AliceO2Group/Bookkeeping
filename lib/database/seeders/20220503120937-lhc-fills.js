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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('lhc_fills', [
        {
            fill_number: 1,
            stable_beams_start: '2022-03-21 13:00:00',
            stable_beams_end: '2022-03-22 15:00:00',
            stable_beams_duration: 100,
            beam_type: 'p-p',
            filling_scheme_name: 'schemename',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
        {
            fill_number: 2,
            stable_beams_start: '2022-03-21 13:00:00',
            stable_beams_end: '2022-03-22 15:00:00',
            stable_beams_duration: 100,
            beam_type: 'p-Pb',
            filling_scheme_name: 'schemename',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
        {
            fill_number: 3,
            stable_beams_start: '2022-03-21 13:00:00',
            stable_beams_end: '2022-03-22 15:00:00',
            stable_beams_duration: 100,
            beam_type: 'Pb-Pb',
            filling_scheme_name: 'schemename',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
        {
            fill_number: 4,
            beam_type: 'p-p',
            filling_scheme_name: 'schemename',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
        {
            fill_number: 5,
            stable_beams_start: '2022-03-21 13:00:00',
            filling_scheme_name: 'schemename',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
        {
            fill_number: 6,
            stable_beams_start: '2019-08-08 11:00:00',
            stable_beams_end: '2019-08-08 23:00:00',
            stable_beams_duration: 60 * 60 * 12,
            filling_scheme_name: 'schemename',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
    ]),
    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('lhc_fills', null, {}),
};
