'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'pdp_workflow_parameters', {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'pdp_beam_type', {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'readout_cfg_uri', {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.removeColumn('runs', 'pdp_workflow_parameters', { transaction }),
                queryInterface.removeColumn('runs', 'pdp_beam_type', { transaction }),
                queryInterface.removeColumn('runs', 'readout_cfg_uri', { transaction }),
            ])),
};
