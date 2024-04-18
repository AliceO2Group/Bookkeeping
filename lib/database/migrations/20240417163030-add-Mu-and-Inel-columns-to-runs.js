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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('runs', 'avg_inelastic_interaction_rate', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('runs', 'inelastic_interaction_rate_at_start', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('runs', 'inelastic_interaction_rate_at_mid', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('runs', 'inelastic_interaction_rate_at_end', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('runs', 'avg_inelastic_interaction_rate', { transaction });
        await queryInterface.removeColumn('runs', 'inelastic_interaction_rate_at_start', { transaction });
        await queryInterface.removeColumn('runs', 'inelastic_interaction_rate_at_mid', { transaction });
        await queryInterface.removeColumn('runs', 'inelastic_interaction_rate_at_end', { transaction });
    }),
};
