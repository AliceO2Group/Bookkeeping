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
     * Add 2 columns for mattermost channel and email lists.
     */
    async up({ context: { Sequelize, queryInterface } }) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('tags', 'email', { type: Sequelize.STRING }, { transaction });
            await queryInterface.addColumn('tags', 'mattermost', { type: Sequelize.STRING }, { transaction });
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
            await queryInterface.removeColumn('tags', 'email', { transaction });
            await queryInterface.removeColumn('tags', 'mattermost', { transaction });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
};
