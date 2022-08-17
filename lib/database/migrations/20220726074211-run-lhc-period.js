'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'lhc_period', {
                    type: Sequelize.DataTypes.CHAR(64),
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.removeColumn('runs', 'lhc_period', { transaction })])),
};
