'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('log_lhcFills', {
            logId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            lhcFillNumber: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('log_lhcFills');
    },
};
