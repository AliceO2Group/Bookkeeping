'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.addColumn('runs', 'fill_number', {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            default: null,
        }, { transaction: t }),
        queryInterface.addColumn('runs', 'lhc_beam_energy', {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
            default: null,
        }, { transaction: t }),
        queryInterface.addColumn('runs', 'lhc_beam_mode', {
            type: Sequelize.DataTypes.CHAR(32),
            allowNull: true,
            default: null,
        }, { transaction: t }),
        queryInterface.addColumn('runs', 'lhc_beta_star', {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
            default: null,
        }, { transaction: t }),
        queryInterface.addColumn('runs', 'alice_l3_current', {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
            default: null,
        }, { transaction: t }),
        queryInterface.addColumn('runs', 'alice_dipole_current', {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
            default: null,
        }, { transaction: t }),
    ])),

    down: async ({ context: { queryInterface } }) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeColumn('runs', 'fill_number', { transaction: t }),
        queryInterface.removeColumn('runs', 'lhc_beam_energy', { transaction: t }),
        queryInterface.removeColumn('runs', 'lhc_beam_mode', { transaction: t }),
        queryInterface.removeColumn('runs', 'lhc_beta_star', { transaction: t }),
        queryInterface.removeColumn('runs', 'alice_l3_current', { transaction: t }),
        queryInterface.removeColumn('runs', 'alice_dipole_current', { transaction: t }),
    ])),
};
