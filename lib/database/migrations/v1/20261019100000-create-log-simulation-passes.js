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

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.createTable('log_simulation_passes', {
        log_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: 'logs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        simulation_pass_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: 'simulation_passes', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
    }),

    down: async (queryInterface) => queryInterface.dropTable('log_simulation_passes'),
};
