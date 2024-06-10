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
        await queryInterface.createTable('data_pass_versions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            data_pass_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'data_passes',
                    key: 'id',
                },
            },
            description: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            output_size: {
                type: Sequelize.BIGINT,
            },
            reconstructed_events_count: {
                type: Sequelize.INTEGER,
            },
            last_seen: {
                type: Sequelize.INTEGER,
                comment: 'Change of this property in MonALISA means recent job activity that changed data pass version properties',
            },

            // Timestamps
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        }, { transaction });

        // Migrate
        await queryInterface.sequelize.query(`
            INSERT INTO data_pass_versions (data_pass_id, description, output_size, reconstructed_events_count)
            SELECT id, description, output_size, reconstructed_events_count
                FROM data_passes
        `, { transaction });

        await queryInterface.removeColumn('data_passes', 'description', { transaction });
        await queryInterface.removeColumn('data_passes', 'output_size', { transaction });
        await queryInterface.removeColumn('data_passes', 'reconstructed_events_count', { transaction });
        await queryInterface.removeColumn('data_passes', 'last_run_number', { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('data_passes', 'description', { type: Sequelize.TEXT }, { transaction });
        await queryInterface.addColumn('data_passes', 'output_size', { type: Sequelize.BIGINT }, { transaction });
        await queryInterface.addColumn('data_passes', 'reconstructed_events_count', { type: Sequelize.INTEGER }, { transaction });
        await queryInterface.addColumn('data_passes', 'last_run_number', { type: Sequelize.INTEGER }, { transaction });

        // Migrate
        await queryInterface.sequelize.query(`
            UPDATE data_passes
            INNER JOIN (
                WITH lastwin as (
                    SELECT 
                        id,
                        data_pass_id,
                        description,
                        output_size,
                        reconstructed_events_count,
                        ROW_NUMBER() OVER (PARTITION BY data_pass_id ORDER BY id DESC) as rn
                    FROM data_pass_versions
                )
                SELECT data_pass_id, description, output_size, reconstructed_events_count
                FROM lastwin
                WHERE rn = 1
            ) as recent_data_pass_version

                ON recent_data_pass_version.data_pass_id = data_passes.id

            SET data_passes.description = recent_data_pass_version.description,
                data_passes.output_size = recent_data_pass_version.output_size,
                data_passes.reconstructed_events_count = recent_data_pass_version.reconstructed_events_count
            
        `, { transaction });

        await queryInterface.dropTable('data_pass_versions', { transaction });
    }),
};
