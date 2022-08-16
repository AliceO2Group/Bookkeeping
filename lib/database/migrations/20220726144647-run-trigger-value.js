'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addColumn('runs', 'trigger_value', {
            type: Sequelize.DataTypes.ENUM('OFF', 'LTU', 'CTP'),
            allowNull: true,
            default: null,
        }, { transaction: t }),
    ])),

    down: async ({ context: { queryInterface } }) => queryInterface.sequelize.transaction((t) =>
        Promise.all([queryInterface.removeColumn('runs', 'trigger_value', { transaction: t })])),
};
