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
const { DetectorType } = require('../../domain/enums/DetectorTypes');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        if (1) {
            throw new Error();
        }

        const [constraints] = await queryInterface.sequelize.query(`
            SELECT CONSTRAINT_NAME, UNIQUE_CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
            FROM information_schema.REFERENTIAL_CONSTRAINTS
            WHERE REFERENCED_TABLE_NAME = 'dpl_detectors'
        `, { transaction });

        for (const { CONSTRAINT_NAME, TABLE_NAME } of constraints) {
            await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME, { transaction });
            let columnName = 'dpl_detector_id';
            if (TABLE_NAME === 'dpl_process_executions') {
                columnName = 'detector_id';
            }
            await queryInterface.addConstraint(TABLE_NAME, {
                type: 'FOREIGN KEY',
                fields: [columnName],
                name: `detector_id_fk_${TABLE_NAME.toLowerCase()}`,
                references: {
                    table: 'detectors',
                    field: 'id',
                },
            }, { transaction });
            await queryInterface.query(`ALTER TABLE ${TABLE_NAME} RENAME COLUMN ${columnName} TO detector_id`, { transaction });
        }

        await queryInterface.dropTable('dpl_detectors', { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('dpl_detectors', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
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
            INSERT INTO dpl_detectors(id, name)
                SELECT id, name
                FROM detectors
                WHERE type != '${DetectorType.VIRTUAL}'
        `, { transaction });

        const [constraints] = await queryInterface.sequelize.query(`
            SELECT CONSTRAINT_NAME, UNIQUE_CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
            FROM information_schema.REFERENTIAL_CONSTRAINTS
            WHERE REFERENCED_TABLE_NAME = 'detectors'
                AND TABLE_NAME != 'run_detectors'
        `, { transaction });

        for (const { CONSTRAINT_NAME, TABLE_NAME } of constraints) {
            await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME, { transaction });
            await queryInterface.addConstraint(TABLE_NAME, {
                type: 'FOREIGN KEY',
                fields: ['detector_id'],
                name: `dpl_detector_id_fk_${TABLE_NAME.toLowerCase()}`,
                references: {
                    table: 'dpl_detectors',
                    field: 'id',
                },
            }, { transaction });
            if (TABLE_NAME !== 'dpl_process_executions') {
                await queryInterface.query(`ALTER TABLE ${TABLE_NAME} RENAME COLUMN detector_id TO dpl_detector_id`, { transaction });
            }
        }
    }),
};
