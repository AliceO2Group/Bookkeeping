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
    up: ({ context: { Sequelize, queryInterface } }) => queryInterface.createTable('attachments', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        file_name: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        size: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        mime_type: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        original_name: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        path: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        encoding: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        log_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'logs',
                key: 'id',
            },
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

    down: ({ context: { queryInterface } }) => queryInterface.dropTable('attachments'),
};
