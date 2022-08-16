'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addColumn('runs', 'odc_topology_full_name', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            default: null,
        }, { transaction: t }),
    ])),

    down: async ({ context: { queryInterface } }) => queryInterface.sequelize.transaction((t) =>
        Promise.all([queryInterface.removeColumn('runs', 'odc_topology_full_name', { transaction: t })])),
};
