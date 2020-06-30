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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('log_subsystems', [
        {
            log_id: 3,
            subsystem_id: 1,
        },
        {
            log_id: 2,
            subsystem_id: 2,
        },
        {
            log_id: 1,
            subsystem_id: 3,
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('log_subsystems', null, {}),
};
