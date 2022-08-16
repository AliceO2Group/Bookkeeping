'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addColumn('runs', 'lhc_period', {
            type: Sequelize.DataTypes.CHAR(64),
            allowNull: true,
            default: null,
        }, { transaction: t }),
    ])),

    down: async ({ context: { queryInterface } }) => queryInterface.sequelize.transaction((t) =>
        Promise.all([queryInterface.removeColumn('runs', 'lhc_period', { transaction: t })])),
};
