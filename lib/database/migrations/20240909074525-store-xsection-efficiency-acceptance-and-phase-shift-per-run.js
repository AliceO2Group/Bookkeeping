/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.addColumn('runs', 'cross_section', {
            type: Sequelize.DOUBLE,
            allowNull: true,
        });
        await queryInterface.addColumn('runs', 'trigger_efficiency', {
            type: Sequelize.DOUBLE,
            allowNull: true,
        });
        await queryInterface.addColumn('runs', 'trigger_acceptance', {
            type: Sequelize.DOUBLE,
            allowNull: true,
        });
        await queryInterface.addColumn('runs', 'phase_shift_at_start', {
            type: Sequelize.DOUBLE,
            allowNull: true,
        });
        await queryInterface.addColumn('runs', 'phase_shift_at_end', {
            type: Sequelize.DOUBLE,
            allowNull: true,
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('runs', 'cross_section', { transaction });
        await queryInterface.removeColumn('runs', 'trigger_efficiency', { transaction });
        await queryInterface.removeColumn('runs', 'trigger_acceptance', { transaction });
        await queryInterface.removeColumn('runs', 'phase_shift_at_start', { transaction });
        await queryInterface.removeColumn('runs', 'phase_shift_at_end', { transaction });
    }),
};
