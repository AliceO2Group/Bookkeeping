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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('Logs', [
        {
            title: 'First entry',
            subtype: 'run',
            origin: 'human',
            user_id: 1,
            text: 'Power interruption due to unplugged wire.',
        },
        {
            title: 'Second entry',
            subtype: 'subsystem',
            origin: 'process',
            user_id: 1,
            text: 'Detected particle ABC123',
        },
        {
            title: 'Third entry',
            subtype: 'announcement',
            origin: 'human',
            user_id: 1,
            text: 'Cake at the particle accelerator!',
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('Logs', null, {}),
};
