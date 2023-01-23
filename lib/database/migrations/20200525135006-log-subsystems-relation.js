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
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.createTable('log_subsystems', {
                    log_id: {
                        primaryKey: true,
                        allowNull: false,
                        type: Sequelize.INTEGER,
                    },
                    subsystem_id: {
                        primaryKey: true,
                        allowNull: false,
                        type: Sequelize.INTEGER,
                    },
                    created_at: {
                        allowNull: false,
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                    updated_at: {
                        allowNull: false,
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                    },
                }, { transaction })
                    .then(() => queryInterface.addConstraint('log_subsystems', {
                        fields: ['log_id'],
                        type: 'foreign key',
                        name: 'fk_log_id_log_subsystems',
                        references: {
                            table: 'logs',
                            field: 'id',
                        },
                    }, { transaction }))
                    .then(() => queryInterface.addConstraint('log_subsystems', {
                        fields: ['subsystem_id'],
                        type: 'foreign key',
                        name: 'fk_subsystem_id_log_subsystems',
                        references: {
                            table: 'subsystems',
                            field: 'id',
                        },
                    }, { transaction })),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.removeConstraint('log_subsystems', 'fk_subsystem_id_log_subsystems', { transaction }),
                queryInterface.removeConstraint('log_subsystems', 'fk_log_id_log_subsystems', { transaction }),
                queryInterface.dropTable('log_subsystems', { transaction }),
            ])),
};
