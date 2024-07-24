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
        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['detector_id'],
            name: 'detector_id_fk_run_detectors',
            references: {
                table: 'detectors',
                field: 'id',
            },
            onUpdate: 'CASCADE',
        }, { transaction });

        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['run_number'],
            name: 'run_number_fk_run_detectors',
            references: {
                table: 'runs',
                field: 'run_number',
            },
        }, { transaction });

        const { DETECTOR_TYPES, DetectorType } = await import('../../public/domain/enums/DetectorTypes.mjs');

        await queryInterface.addColumn(
            'detectors',
            'type',
            { type: Sequelize.ENUM(...DETECTOR_TYPES), allowNull: false },
            { transaction },
        );
        await queryInterface.sequelize.query(`
        UPDATE detectors
            SET type = '${DetectorType.Physical}'
        `, { transaction });

        await queryInterface.sequelize.query(`
        UPDATE detectors
            SET type = '${DetectorType.Virtual}'
            WHERE name = 'TST'
        `, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeConstraint('run_detectors', 'detector_id_fk_run_detectors', { transaction });
        await queryInterface.removeConstraint('run_detectors', 'run_number_fk_run_detectors', { transaction });

        await queryInterface.removeColumn('detectors', 'type', { transaction });
    }),
};
