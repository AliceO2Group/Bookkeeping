'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addColumn('runs', 'alice_l3_polarity', {
            type: Sequelize.DataTypes.CHAR(32),
            allowNull: true,
            default: null,
        }, { transaction: t }),
        queryInterface.addColumn('runs', 'alice_dipole_polarity', {
            type: Sequelize.DataTypes.CHAR(32),
            allowNull: true,
            default: null,
        }, { transaction: t }),
    ])),

    down: async (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeColumn('runs', 'alice_l3_polarity', { transaction: t }),
        queryInterface.removeColumn('runs', 'alice_dipole_polarity', { transaction: t }),
    ])),
};
