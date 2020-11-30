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
        queryInterface.addConstraint('run_tags', {
            fields: ['run_id'],
            type: 'foreign key',
            name: 'fk_run_id_run_tags',
            references: {
                table: 'runs',
                field: 'id',
            },
        }, { transaction: t }),
        queryInterface.addConstraint('run_tags', {
            fields: ['tag_id'],
            type: 'foreign key',
            name: 'fk_tag_id_run_tags',
            references: {
                table: 'tags',
                field: 'id',
            },
        }, { transaction: t }),

        queryInterface.addConstraint('run_tags', {
            fields: ['tag_id', 'run_id'],
            type: 'unique',
            name: 'unique_tag_id_run_id_run_tags',
        }, { transaction: t }),
    ])),

    down: (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeConstraint('run_tags', 'fk_run_id_run_tags', { transaction: t }),
        queryInterface.removeConstraint('run_tags', 'fk_tag_id_run_tags', { transaction: t }),
        queryInterface.removeConstraint('run_tags', 'unique_tag_id_run_id_run_tags', { transaction: t }),
    ])),
};
