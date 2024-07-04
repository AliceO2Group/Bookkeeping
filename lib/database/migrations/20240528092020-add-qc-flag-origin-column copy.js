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
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query('ALTER TABLE quality_control_flag_effective_periods MODIFY `from` DATETIME NULL', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE quality_control_flag_effective_periods MODIFY `to` DATETIME NULL', { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(
            'ALTER TABLE quality_control_flag_effective_periods MODIFY `from` datetime NOT NULL',
            { transaction },
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE quality_control_flag_effective_periods MODIFY `to` datetime NOT NULL',
            { transaction },
        );
    }),
};
