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
/* eslint-disable valid-jsdoc */

module.exports = {

    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.createTable('eor_reasons', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true,
                        type: Sequelize.INTEGER,
                    },
                    description: {
                        type: Sequelize.STRING,
                    },
                    last_edited_name: {
                        type: Sequelize.STRING,
                    },
                    reason_type_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: 'reason_types',
                            key: 'id',
                        },
                    },
                    run_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: 'runs',
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
                }, {
                    timestamps: true,
                    transaction,
                }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.dropTable('eor_reasons', {
                    transaction,
                }),
            ])),
};
