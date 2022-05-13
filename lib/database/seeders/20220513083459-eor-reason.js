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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('eor_reasons', [
        {
            category: 'DETECTORS',
            title: 'CPV',
            last_edited_name: 'Anonymous',
            created_at: new Date('2022-08-09'),
            updated_at: new Date('2022-08-10 15:00:00'),
        },
        {
            category: 'DETECTORS',
            title: 'TPC',
            last_edited_name: 'Anonymous',
            created_at: new Date('2022-08-09'),
            updated_at: new Date('2022-08-10 05:00:00'),
        },
        {
            category: 'Data Sanity and Quality',
            title: 'Incomplete TF ',
            last_edited_name: 'Anonymous',
            created_at: new Date('2021-08-09'),
            updated_at: new Date('2021-08-10 15:00:00'),
        },
        {
            category: 'Data Sanity and Quality',
            title: 'Rejected TF ',
            last_edited_name: 'Anonymous',
            created_at: new Date('2021-07-09'),
            updated_at: new Date('2021-07-10 15:00:00'),
        },
        {
            category: 'Other',
            last_edited_name: 'Anonymous',
            created_at: new Date('2020-08-09'),
            updated_at: new Date('2020-08-10 15:00:00'),
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('eor_reasons', null, {}),
};
