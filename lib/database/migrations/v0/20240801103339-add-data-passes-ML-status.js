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

const { Sequelize } = require('sequelize');
const { DATA_PASS_VERSION_STATUSES, DataPassVersionStatus } = require('../../../domain/enums/DataPassVersionStatus.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('data_pass_version_status_history', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(...DATA_PASS_VERSION_STATUSES),
                allowNull: false,
            },

            data_pass_version_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'data_pass_versions',
                    key: 'id',
                },
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

        await queryInterface.sequelize.query(`
            INSERT INTO data_pass_version_status_history(data_pass_version_id, status, created_at, updated_at)
                SELECT id, :status, created_at, created_at
                    FROM data_pass_versions
        `, { transaction, replacements: { status: DataPassVersionStatus.RUNNING } });
        await queryInterface.sequelize.query(`
            INSERT INTO data_pass_version_status_history(data_pass_version_id, status, created_at, updated_at)
                SELECT id, :status, updated_at, updated_at
                    FROM data_pass_versions
                    WHERE deleted_from_monalisa = true
        `, { transaction, replacements: { status: DataPassVersionStatus.DELETED } });

        await queryInterface.removeColumn('data_pass_versions', 'deleted_from_monalisa', { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('data_pass_versions', 'deleted_from_monalisa', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }, { transaction });

        await queryInterface.sequelize.query(`
            UPDATE data_pass_versions AS dpv
            INNER JOIN (
                WITH status_window AS (
                    SELECT
                        id,
                        data_pass_version_id,
                        status,
                        ROW_NUMBER() OVER (PARTITION BY data_pass_version_id ORDER BY created_at DESC) AS rn
                    FROM data_pass_version_status_history
                )
                SELECT *
                FROM status_window
                WHERE rn = 1 AND status = :statusDeleted
            ) AS last_status
                ON last_status.data_pass_version_id = dpv.id

            SET dpv.deleted_from_monalisa = true
        `, { transaction, replacements: { statusDeleted: DataPassVersionStatus.DELETED } });

        await queryInterface.dropTable('data_pass_version_status_history', { transaction });
    }),
};
