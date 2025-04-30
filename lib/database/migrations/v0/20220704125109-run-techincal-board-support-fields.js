'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'trg_global_run_enabled', {
                    type: Sequelize.DataTypes.BOOLEAN,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'trg_enabled', {
                    type: Sequelize.DataTypes.BOOLEAN,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'pdp_config_option', {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'pdp_topology_description_library_file', {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'tfb_dd_mode', {
                    type: Sequelize.DataTypes.CHAR(64),
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.removeColumn('runs', 'trg_global_run_enabled', { transaction }),
                queryInterface.removeColumn('runs', 'trg_enabled', { transaction }),
                queryInterface.removeColumn('runs', 'pdp_config_option', { transaction }),
                queryInterface.removeColumn('runs', 'pdp_topology_description_library_file', { transaction }),
                queryInterface.removeColumn('runs', 'tfb_dd_mode', { transaction }),
            ])),
};
