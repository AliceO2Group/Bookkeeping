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
