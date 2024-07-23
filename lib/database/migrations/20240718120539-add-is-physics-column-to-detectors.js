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

        await queryInterface.addColumn('detectors', 'is_physical', { type: Sequelize.BOOLEAN }, { transaction });
        await queryInterface.sequelize.query(`
        UPDATE detectors
            SET is_physical = True
    `, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeConstraint('run_detectors', 'detector_id_fk_run_detectors', { transaction });
        await queryInterface.removeConstraint('run_detectors', 'run_number_fk_run_detectors', { transaction });

        await queryInterface.removeColumn('detectors', 'is_physical', { transaction });
    }),
};
