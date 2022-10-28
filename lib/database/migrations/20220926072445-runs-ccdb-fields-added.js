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

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'start_of_data_transfer', {
                    type: Sequelize.DataTypes.DATE,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'end_of_data_transfer', {
                    type: Sequelize.DataTypes.DATE,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'ctf_file_count', {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'ctf_file_size', {
                    type: Sequelize.DataTypes.BIGINT,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'tf_file_count', {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'tf_file_size', {
                    type: Sequelize.DataTypes.BIGINT,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'other_file_count', {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'other_file_size', {
                    type: Sequelize.DataTypes.BIGINT,
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),
    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.removeColumn('runs', 'start_of_data_transfer', { transaction }),
                queryInterface.removeColumn('runs', 'end_of_data_transfer', { transaction }),
                queryInterface.removeColumn('runs', 'ctf_file_count', { transaction }),
                queryInterface.removeColumn('runs', 'ctf_file_size', { transaction }),
                queryInterface.removeColumn('runs', 'tf_file_count', { transaction }),
                queryInterface.removeColumn('runs', 'tf_file_size', { transaction }),
                queryInterface.removeColumn('runs', 'other_file_count', { transaction }),
                queryInterface.removeColumn('runs', 'other_file_size', { transaction }),
            ])),
};
