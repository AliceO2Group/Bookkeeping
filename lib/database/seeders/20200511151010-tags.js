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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('tags', [
        {
            text: 'FOOD',
        },
        {
            text: 'RUN',
        },
        {
            text: 'MAINTENANCE',
        },
        {
            text: 'GLOBAL',
        },
        {
            text: 'TEST',
        },
        {
            text: 'OTHER',
        },
        { text: 'TEST-TAG-1' },
        { text: 'TEST-TAG-2' },
        { text: 'TEST-TAG-3' },
        { text: 'TEST-TAG-4' },
        { text: 'TEST-TAG-5' },
        { text: 'TEST-TAG-6' },
        { text: 'TEST-TAG-7' },
        { text: 'TEST-TAG-8' },
        { text: 'TEST-TAG-9' },
        { text: 'TEST-TAG-10' },
        { text: 'TEST-TAG-11' },
        { text: 'TEST-TAG-12' },
        { text: 'TEST-TAG-13' },
        { text: 'TEST-TAG-14' },
        { text: 'TEST-TAG-15' },
        { text: 'TEST-TAG-16' },
        { text: 'TEST-TAG-17' },
        { text: 'TEST-TAG-18' },
        { text: 'TEST-TAG-19' },
        { text: 'TEST-TAG-20' },
        { text: 'TEST-TAG-21' },
        { text: 'TEST-TAG-22' },
        { text: 'TEST-TAG-23' },
        { text: 'TEST-TAG-24' },
        { text: 'TEST-TAG-25' },
        { text: 'TEST-TAG-26' },
        { text: 'TEST-TAG-27' },
        { text: 'TEST-TAG-28' },
        { text: 'TEST-TAG-29' },
        { text: 'TEST-TAG-30' },
        { text: 'TEST-TAG-31' },
        { text: 'TEST-TAG-32' },
        { text: 'TEST-TAG-33' },
        { text: 'TEST-TAG-34' },
        { text: 'TEST-TAG-35' },
        { text: 'TEST-TAG-36' },
        { text: 'TEST-TAG-37' },
        { text: 'TEST-TAG-38' },
        { text: 'TEST-TAG-39' },
        { text: 'TEST-TAG-40' },
        { text: 'TEST-TAG-41' },
        { text: 'TEST-TAG-42' },
        { text: 'TEST-TAG-43' },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('tags', null, {}),
};
