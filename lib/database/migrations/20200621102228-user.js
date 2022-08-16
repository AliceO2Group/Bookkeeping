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
    up: async ({ context: { Sequelize, queryInterface } }) => {
        try {
            await queryInterface.removeColumn('users', 'token');
            await queryInterface.removeColumn('users', 'token_valid_until');

            await queryInterface.addColumn('users', 'name', {
                type: Sequelize.STRING,
            });

            await queryInterface.addIndex('users', {
                name: 'users_external_id_idx',
                fields: ['external_id'],
            });

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },

    down: async ({ context: { queryInterface, Sequelize } }) => {
        try {
            await queryInterface.removeIndex('users', 'users_external_id_idx');

            await queryInterface.removeColumn('users', 'name');

            await queryInterface.addColumn('users', 'token_valid_until', {
                type: Sequelize.DATE,
            });
            await queryInterface.addColumn('users', 'token', {
                type: Sequelize.STRING,
            });

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },
};
