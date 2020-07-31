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

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('runs', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        time_o2_start: {
            type: Sequelize.DATE,
        },
        time_o2_end: {
            type: Sequelize.DATE,
        },
        time_trg_start: {
            type: Sequelize.DATE,
        },
        time_trg_end: {
            type: Sequelize.DATE,
        },
        activity_id: {
            type: Sequelize.CHAR,
        },
        run_type: {
            type: Sequelize.ENUM('physics', 'cosmics', 'technical'),
        },
        run_quality: {
            type: Sequelize.ENUM('good', 'bad', 'unknown'),
        },
        n_detectors: {
            type: Sequelize.INTEGER,
        },
        n_flps: {
            type: Sequelize.INTEGER,
        },
        n_epns: {
            type: Sequelize.INTEGER,
        },
        n_subtimeframes: {
            type: Sequelize.INTEGER,
        },
        bytes_read_out: {
            type: Sequelize.INTEGER,
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
    }),

    down: (queryInterface, _Sequelize) => queryInterface.dropTable('runs'),
};
