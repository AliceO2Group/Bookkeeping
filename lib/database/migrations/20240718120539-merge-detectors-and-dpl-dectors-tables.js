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
        await queryInterface.sequelize.query(`
            UPDATE run_detectors AS rd
                INNER JOIN detectors AS d
                    ON d.id = rd.detector_id
                LEFT JOIN dpl_detectors as dpld
                    ON dpld.name = d.name
                SET rd.detector_id = dpld.id
        `, { transaction });

        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['detector_id'],
            name: 'detector_id_fk_detectors',
            references: {
                table: 'dpl_detectors',
                field: 'id',
            },
        }, { transaction });

        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['run_number'],
            name: 'run_number_fk_runs',
            references: {
                table: 'runs',
                field: 'run_number',
            },
        }, { transaction });

        await queryInterface.addColumn('dpl_detectors', 'is_physical', { type: Sequelize.BOOLEAN }, { transaction });

        await queryInterface.sequelize.query(`
            INSERT INTO dpl_detectors (name)
                SELECT name FROM detectors
                    WHERE name NOT IN (SELECT name FROM dpl_detectors)
        `, { transaction });

        await queryInterface.sequelize.query(`
            UPDATE dpl_detectors AS dpld
                INNER JOIN detectors AS d
                    ON d.name = dpld.name
                SET dpld.is_physical = true
        `, { transaction });

        await queryInterface.sequelize.query(`
            ALTER TABLE quality_control_flags
            RENAME COLUMN dpl_detector_id TO detector_id
        `, { transaction });
        await queryInterface.sequelize.query(`
            ALTER TABLE global_aggregated_quality_detectors 
            RENAME COLUMN dpl_detector_id TO detector_id
        `, { transaction });
        await queryInterface.dropTable('detectors', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE dpl_detectors RENAME TO detectors', { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('detectors_tmp', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.CHAR(32),
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
        }, {
            timestamps: true,
            transaction,
        });

        await queryInterface.removeConstraint('run_detectors', 'detector_id_fk_detectors', { transaction });
        await queryInterface.removeConstraint('run_detectors', 'run_number_fk_runs', { transaction });

        await queryInterface.sequelize.query(`
            INSERT INTO detectors_tmp(name)
            SELECT name FROM detectors 
                WHERE is_physical is True
            `, { transaction });

        await queryInterface.sequelize.query(`
                UPDATE run_detectors AS rd
                    INNER JOIN detectors AS d
                        ON d.id = rd.detector_id
                    INNER JOIN detectors_tmp as dt
                        ON dt.name = d.name
                    SET rd.detector_id = dt.id
            `, { transaction });

        await queryInterface.sequelize.query(`
                ALTER TABLE quality_control_flags
                RENAME COLUMN detector_id TO dpl_detector_id
            `, { transaction });
        await queryInterface.sequelize.query(`
                ALTER TABLE global_aggregated_quality_detectors 
                RENAME COLUMN detector_id TO dpl_detector_id
            `, { transaction });

        await queryInterface.removeColumn('detectors', 'is_physical', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE detectors RENAME TO dpl_detectors', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE detectors_tmp RENAME TO detectors', { transaction });
    }),
};
