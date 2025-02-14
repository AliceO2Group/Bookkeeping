'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.addColumn('lhc_fills', 'colliding_bunches_count', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        await queryInterface.addColumn('lhc_fills', 'delivered_luminosity', {
            type: Sequelize.DOUBLE,
            allowNull: true,
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('data_passes', 'delivered_luminosity', { transaction });
        await queryInterface.removeColumn('data_passes', 'colliding_bunches_count', { transaction });
    }),
};
