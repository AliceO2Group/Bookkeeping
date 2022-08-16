'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addColumn('runs', 'lhc_period', {
            type: Sequelize.DataTypes.CHAR(64),
            allowNull: true,
            default: null,
        }, { transaction: t }),
    ])),

    down: async (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) =>
        Promise.all([queryInterface.removeColumn('runs', 'lhc_period', { transaction: t })])),
};
