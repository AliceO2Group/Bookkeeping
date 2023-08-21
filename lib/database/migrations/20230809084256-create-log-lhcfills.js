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

const Log = require('../models/log.js')
const LhcFill = require('../models/lhcFill.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('log_lhc_fills', {
            log_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            fill_number: {
                type: Sequelize.INTEGER,
                primaryKey: true,
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
        });
        await queryInterface.addConstraint('log_lhc_fills', {
            fields: ['log_id'],
            type: 'foreign key',
            name: 'fk_log_id_log_lhc_fills',
            references: {
                table: 'logs',
                field: 'id',
            },
        })
        await queryInterface.addConstraint('log_lhc_fills', {
            fields: ['fill_number'],
            type: 'foreign key',
            name: 'fk_fill_number_log_lhc_fills',
            references: {
                table: 'lhc_fills',
                field: 'fill_number',
            },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('log_lhc_fills');
    },
};
