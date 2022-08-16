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
     * Add one column for the last person who edited email/mattermost list.
     */
    async up({ context: { Sequelize, queryInterface } }) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('tags', 'last_edited_name', { type: Sequelize.STRING }, { transaction });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    /**
     * Revert both changes
     */
    async down({ context: { queryInterface } }) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('tags', 'last_edited_name', { transaction });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
};
