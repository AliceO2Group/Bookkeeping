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
                queryInterface.createTable('logs', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true,
                        type: Sequelize.INTEGER,
                    },
                    title: {
                        allowNull: false,
                        type: Sequelize.STRING,
                    },
                    text: {
                        allowNull: false,
                        type: Sequelize.TEXT,
                    },
                    subtype: {
                        allowNull: false,
                        type: Sequelize.ENUM('run', 'subsystem', 'announcement', 'intervention', 'comment'),
                    },
                    origin: {
                        allowNull: false,
                        type: Sequelize.ENUM('human', 'process'),
                    },
                    announcement_valid_until: {
                        type: Sequelize.DATE,
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
                }, {
                    timestamps: true,
                    transaction,
                }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.dropTable('logs', { transaction })])),
};
