/*
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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('eor_reasons', 'last_edited_by_user_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        }, { transaction });

        // Link existing EoR reasons to the user matching the stored name (ambiguous names resolve to the oldest user)
        await queryInterface.sequelize.query(
            `UPDATE eor_reasons e
            SET e.last_edited_by_user_id = (SELECT MIN(u.id) FROM users u WHERE u.name = e.last_edited_name)
            WHERE e.last_edited_name IS NOT NULL`,
            { transaction },
        );

        await queryInterface.removeColumn('eor_reasons', 'last_edited_name', { transaction });
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('eor_reasons', 'last_edited_name', {
            type: Sequelize.STRING,
            allowNull: true,
        }, { transaction });

        await queryInterface.sequelize.query(
            `UPDATE eor_reasons e
            INNER JOIN users u ON u.id = e.last_edited_by_user_id
            SET e.last_edited_name = u.name`,
            { transaction },
        );

        await queryInterface.removeColumn('eor_reasons', 'last_edited_by_user_id', { transaction });
    }),
};
