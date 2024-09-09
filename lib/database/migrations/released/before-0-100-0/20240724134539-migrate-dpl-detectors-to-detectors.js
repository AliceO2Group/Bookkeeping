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
const { DetectorType, DATA_TAKING_DETECTOR_TYPES } = require('../../../../domain/enums/DetectorTypes.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE dpl_processes_executions RENAME COLUMN detector_id TO dpl_detector_id
        `, { transaction });

        await queryInterface.sequelize.query(`
        INSERT INTO detectors(id, name, type)
            SELECT id, name, '${DetectorType.QC_ONLY}'
            FROM dpl_detectors
            WHERE name != '' AND name NOT IN (SELECT name from detectors)
        `, { transaction });

        await queryInterface.sequelize.query(`
        INSERT INTO detectors(id, name, type)
            SELECT id, name, '${DetectorType.OTHER}'
            FROM dpl_detectors
            WHERE name = '' AND name NOT IN (SELECT name from detectors)
        `, { transaction });

        const [constraints] = await queryInterface.sequelize.query(`
            SELECT CONSTRAINT_NAME, UNIQUE_CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
            FROM information_schema.REFERENTIAL_CONSTRAINTS
            WHERE REFERENCED_TABLE_NAME = 'dpl_detectors'
        `, { transaction });

        for (const { CONSTRAINT_NAME, TABLE_NAME } of constraints) {
            await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME, { transaction });

            await queryInterface.sequelize.query(`
                UPDATE ${TABLE_NAME} AS u
                    INNER JOIN dpl_detectors AS dpl
                        ON dpl.id = u.dpl_detector_id
                    INNER JOIN detectors AS d
                        ON d.name = dpl.name
                    SET u.dpl_detector_id = d.id
            `);

            await queryInterface.addConstraint(TABLE_NAME, {
                type: 'FOREIGN KEY',
                fields: ['dpl_detector_id'],
                name: `detector_id_fk_${TABLE_NAME.toLowerCase()}`,
                references: {
                    table: 'detectors',
                    field: 'id',
                },
            }, { transaction });
            await queryInterface.sequelize.query(`ALTER TABLE ${TABLE_NAME} RENAME COLUMN dpl_detector_id TO detector_id`, { transaction });
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
            INSERT INTO dpl_detectors(name)
                SELECT name
                FROM detectors
        `, { transaction });

        const [constraints] = await queryInterface.sequelize.query(`
            SELECT CONSTRAINT_NAME, UNIQUE_CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
            FROM information_schema.REFERENTIAL_CONSTRAINTS
            WHERE REFERENCED_TABLE_NAME = 'detectors'
                AND TABLE_NAME != 'run_detectors'
        `, { transaction });

        for (const { CONSTRAINT_NAME, TABLE_NAME } of constraints) {
            await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME, { transaction });
            await queryInterface.sequelize.query(`
                UPDATE ${TABLE_NAME} AS u
                    INNER JOIN detectors AS d
                        ON d.id = u.detector_id
                    INNER JOIN dpl_detectors AS dpl
                        ON d.name = dpl.name
                    SET u.detector_id = dpl.id
            `);

            await queryInterface.addConstraint(TABLE_NAME, {
                type: 'FOREIGN KEY',
                fields: ['detector_id'],
                name: `dpl_detector_id_fk_${TABLE_NAME.toLowerCase()}`,
                references: {
                    table: 'dpl_detectors',
                    field: 'id',
                },
            }, { transaction });

            await queryInterface.sequelize.query(`ALTER TABLE ${TABLE_NAME} RENAME COLUMN detector_id TO dpl_detector_id`, { transaction });
        }

        await queryInterface.sequelize.query(`
        DELETE FROM detectors
            WHERE type NOT IN (${DATA_TAKING_DETECTOR_TYPES.map((type) => `'${type}'`)})
        `, { transaction });

        await queryInterface.sequelize.query(`
            ALTER TABLE dpl_processes_executions RENAME COLUMN dpl_detector_id TO detector_id
        `, { transaction });
    }),
};
