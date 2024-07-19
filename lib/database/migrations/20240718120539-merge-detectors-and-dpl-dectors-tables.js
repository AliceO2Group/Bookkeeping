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
        `);
        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['detector_id'],
            name: 'detector_id_fk_detectors',
            references: {
                table: 'dpl_detectors',
                field: 'id',
            },
        });
        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['run_number'],
            name: 'run_number_fk_runs',
            references: {
                table: 'runs',
                field: 'run_number',
            },
        });

        await queryInterface.addColumn('dpl_detectors', 'is_physical', { type: Sequelize.BOOLEAN });

        await queryInterface.sequelize.query(`
            INSERT INTO dpl_detectors (name)
                SELECT name FROM detectors
                    WHERE name NOT IN (SELECT name FROM dpl_detectors)
                `);

        await queryInterface.sequelize.query(`
            UPDATE dpl_detectors AS dpld
                INNER JOIN detectors AS d
                    ON d.name = dpld.name
                SET dpld.is_physical = true
        `);

        await queryInterface.sequelize.query(`
            ALTER TABLE quality_control_flags
            RENAME COLUMN dpl_detector_id TO detector_id`);
        await queryInterface.sequelize.query(`
            ALTER TABLE global_aggregated_quality_detectors 
            RENAME COLUMN dpl_detector_id TO detector_id
        `);
        await queryInterface.dropTable('detectors', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE dpl_detectors RENAME TO detectors');
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
    }),
};
