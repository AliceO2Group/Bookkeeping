'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.addColumn('runs', 'user_o2_start', {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
        });
        await queryInterface.addColumn('runs', 'user_o2_stop', {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.removeColumn('runs', 'user_o2_start');
        await queryInterface.removeColumn('runs', 'user_o2_stop');
    }),
};
