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
    up: async ({ context: { queryInterface, Sequelize } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.createTable('run_detectors', {
                    run_number: {
                        primaryKey: true,
                        allowNull: false,
                        type: Sequelize.INTEGER,
                    },
                    detector_id: {
                        primaryKey: true,
                        allowNull: false,
                        type: Sequelize.INTEGER,
                    },
                    quality: {
                        type: Sequelize.ENUM('good', 'bad', 'none'),
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
                }, { transaction }),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.dropTable('run_detectors', { transaction })])),
};
