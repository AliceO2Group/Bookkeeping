/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('log_environments', {
            environment_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR,
            },
            log_id: {
                allowNull: false,
                primaryKey: true,
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
        });
        await queryInterface.addConstraint('log_environments', {
            fields: ['log_id'],
            type: 'foreign key',
            name: 'fk_log_id_log_environments',
            references: {
                table: 'logs',
                field: 'id',
            },
        });
        await queryInterface.addConstraint('log_environments', {
            fields: ['environment_id'],
            type: 'foreign key',
            name: 'fk_environment_id_log_environments',
            references: {
                table: 'environments',
                field: 'id',
            },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('log_environments');
    },
};
