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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('logs', [
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
            parent_log_id: 1,
            root_log_id: 1,
        },
        {
            title: 'Third entry',
            subtype: 'announcement',
            origin: 'human',
            user_id: 1,
            text: 'Cake at the particle accelerator!',
            parent_log_id: 1,
            root_log_id: 1,
        },
        {
            title: 'Fourth entry',
            subtype: 'comment',
            origin: 'human',
            user_id: 1,
            text: 'The cake is a lie!',
            parent_log_id: 2,
            root_log_id: 1,
        },
        {
            title: 'Fifth entry',
            subtype: 'run',
            origin: 'process',
            user_id: 1,
            text: 'Run #1 stopped',
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('logs', null, {}),
};
