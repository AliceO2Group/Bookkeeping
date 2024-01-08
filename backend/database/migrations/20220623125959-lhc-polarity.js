'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addColumn('runs', 'alice_l3_polarity', {
                    type: Sequelize.DataTypes.CHAR(32),
                    allowNull: true,
                    default: null,
                }, { transaction }),
                queryInterface.addColumn('runs', 'alice_dipole_polarity', {
                    type: Sequelize.DataTypes.CHAR(32),
                    allowNull: true,
                    default: null,
                }, { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.removeColumn('runs', 'alice_l3_polarity', { transaction }),
                queryInterface.removeColumn('runs', 'alice_dipole_polarity', { transaction }),
            ])),
};
