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

    /**
     * Create a new table with its purpose to define the reasons for which a run was stopped
     */
    async up({ context: { Sequelize, queryInterface } }) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable('reason_types', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    type: Sequelize.INTEGER,
                },
                category: {
                    type: Sequelize.STRING,
                },
                title: {
                    type: Sequelize.STRING,
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
            });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    /**
     * Revert above changes.
     */
    async down({ context: { queryInterface } }) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.dropTable('reason_types');
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
};
