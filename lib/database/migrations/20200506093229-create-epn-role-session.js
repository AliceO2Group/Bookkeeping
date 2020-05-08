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
    up: (queryInterface, Sequelize) => queryInterface.createTable('epn_role_sessions', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
        },
        session_number: {
            type: Sequelize.INTEGER,
        },
        epn_hostname: {
            type: Sequelize.STRING,
        },
        n_subtimeframes: {
            type: Sequelize.INTEGER,
        },
        bytes_in: {
            type: Sequelize.INTEGER,
        },
        bytes_out: {
            type: Sequelize.INTEGER,
        },
        session_start: {
            type: Sequelize.DATE,
        },
        session_end: {
            type: Sequelize.DATE,
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

    down: (queryInterface, _Sequelize) => queryInterface.dropTable('epn_role_sessions'),
};
