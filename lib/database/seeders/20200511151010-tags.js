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
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('tags', [
                    { text: 'FOOD', email: 'food-group@cern.ch', mattermost: 'food', description: 'The food\'s related tag' },
                    { text: 'RUN', email: 'marathon-group@cern.ch', mattermost: 'marathon', description: 'Description for the run tag' },
                    { text: 'MAINTENANCE' },
                    { text: 'GLOBAL' },
                    { text: 'DPG' },
                    { text: 'RC' },
                    { text: 'TEST' },
                    { text: 'SL', email: 'other-group@cern.ch', mattermost: 'other' },
                    { text: 'DCS', email: 'cake@cern.ch', mattermost: 'cake', description: 'The first test tag' },
                    { text: 'ECS' },
                    { text: 'ECS Shifter' },
                    { text: 'DCS Shifter' },
                    { text: 'QC/PDP Shifter' },
                    { text: 'Shift Leader' },
                    { text: 'SLIMOS' },
                    { text: 'QC' },
                    { text: 'PDP' },
                    { text: 'p2info' },
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
                    { text: 'oncall' },
                    { text: 'TEST-TAG-22' },
                    { text: 'TEST-TAG-23' },
                    { text: 'TEST-TAG-24' },
                    { text: 'TEST-TAG-25' },
                    { text: 'TEST-TAG-26' },
                    { text: 'TEST-TAG-27', archived_at: '2022-10-24 13:00' },
                    { text: 'TEST-TAG-28', archived_at: '2022-10-24 12:00' },
                    { text: 'TEST-TAG-29', archived_at: '2022-10-24 12:00' },
                    { text: 'TEST-TAG-30', archived_at: '2022-10-24 14:00' },
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
                    { text: 'PHYSICS' },
                    { text: 'CPV' },
                    { text: 'EoS' },
                    { text: 'FLP' },
                    { text: 'EPN' },
                    { text: 'CTP' },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('tags', null, { transaction })])),
};
