'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('physical_constants', {
            key: {
                primaryKey: true,
                type: Sequelize.STRING,
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('physical_constants', { transaction });
    }),
};
