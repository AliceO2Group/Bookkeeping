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
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('templates', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING(64),
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING(255),
            },
            description: {
                allowNull: true,
                type: Sequelize.TEXT,
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
        }, { transaction });

        await queryInterface.createTable('template_modules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            template_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: { model: 'templates', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            position: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            type: {
                allowNull: false,
                type: Sequelize.STRING(64),
            },
            title: {
                allowNull: true,
                type: Sequelize.STRING(255),
            },
            options: {
                allowNull: false,
                type: Sequelize.JSON,
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
        }, { transaction });

        await queryInterface.addConstraint('template_modules', {
            fields: ['template_id', 'position'],
            type: 'unique',
            name: 'template_modules_template_id_position',
            transaction,
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('template_modules', { transaction });
        await queryInterface.dropTable('templates', { transaction });
    }),
};
