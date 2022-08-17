'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'trigger_value', {
                    type: Sequelize.DataTypes.ENUM('OFF', 'LTU', 'CTP'),
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.removeColumn('runs', 'trigger_value', { transaction })])),
};
