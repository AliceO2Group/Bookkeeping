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
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'from',
            { type: Sequelize.DATE, allowNull: true },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'to',
            { type: Sequelize.DATE, allowNull: true },
            { transaction },
        );
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'from',
            { type: Sequelize.DATE, allowNull: false },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'to',
            { type: Sequelize.DATE, allowNull: false },
            { transaction },
        );
    }),
};
