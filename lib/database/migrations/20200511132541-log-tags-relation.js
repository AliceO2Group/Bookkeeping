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
    up: (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addConstraint('log_tags', {
            fields: ['log_id'],
            type: 'foreign key',
            name: 'fk_log_id_log_tags',
            references: {
                table: 'logs',
                field: 'id',
            },
        }, { transaction: t }),
        queryInterface.addConstraint('log_tags', {
            fields: ['tag_id'],
            type: 'foreign key',
            name: 'fk_tag_id_log_tags',
            references: {
                table: 'tags',
                field: 'id',
            },
        }, { transaction: t }),
    ])),

    down: (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeConstraint('log_tags', 'fk_log_id_log_tags', { transaction: t }),
        queryInterface.removeConstraint('log_tags', 'fk_tag_id_log_tags', { transaction: t }),
    ])),
};
