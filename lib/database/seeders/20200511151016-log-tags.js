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
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('log_tags', [
        {
            log_id: 3,
            tag_id: 1,
        },
        {
            log_id: 2,
            tag_id: 2,
        },
        {
            log_id: 1,
            tag_id: 3,
        },
        {
            log_id: 3,
            tag_id: 4,
        },
        {
            log_id: 2,
            tag_id: 5,
        },
        {
            log_id: 3,
            tag_id: 6,
        },
        {
            log_id: 3,
            tag_id: 1,
        },
        {
            log_id: 2,
            tag_id: 2,
        },
        {
            log_id: 4,
            tag_id: 1,
        },
        {
            log_id: 5,
            tag_id: 2,
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('log_tags', null, {}),
};
