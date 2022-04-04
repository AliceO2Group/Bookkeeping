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
     * Create table for an environment.
     */
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Environments', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING,
            },
            toredown_at: {
                type: Sequelize.DATE,
            },
            status: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            status_message: {
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
        }, {
            timestamps: true,
        });
    },

    /**
     * Reversion if there is a problem.
     */
    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable('Environments');
    },
};
