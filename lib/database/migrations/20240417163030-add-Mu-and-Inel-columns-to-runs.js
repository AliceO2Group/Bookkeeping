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

const a = 1;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        if (a) {
            throw new Error();
        }

        await queryInterface.addColumn('runs', 'mu_tvx', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('runs', 'inel_start', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('runs', 'inel_mid', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('runs', 'inel_end', {
            type: Sequelize.REAL,
            allowNull: true,
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('runs', 'mu_tvx', { transaction });
        await queryInterface.removeColumn('runs', 'inel_start', { transaction });
        await queryInterface.removeColumn('runs', 'inel_mid', { transaction });
        await queryInterface.removeColumn('runs', 'inel_end', { transaction });
    }),
};
