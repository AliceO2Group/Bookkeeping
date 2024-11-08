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

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('quality_control_flag_types', 'monte_carlo_reproducible', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }, { transaction });

        await queryInterface.sequelize.query(`
            UPDATE quality_control_flag_types
            SET monte_carlo_reproducible = true
            WHERE name = 'Limited Acceptance MC Reproducible'
            `);
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('quality_control_flag_types', 'monte_carlo_reproducible', { transaction });
    }),
};
