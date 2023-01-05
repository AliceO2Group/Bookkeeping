'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'odc_topology_full_name', {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.removeColumn('runs', 'odc_topology_full_name', { transaction })])),
};
