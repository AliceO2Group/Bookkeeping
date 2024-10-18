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
        await queryInterface.createTable('global_aggregated_quality_detectors', {
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
            run_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'runs',
                    key: 'run_number',
                },
            },
            dpl_detector_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'dpl_detectors',
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
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('global_aggregated_quality_detectors', { transaction });
    }),
};
