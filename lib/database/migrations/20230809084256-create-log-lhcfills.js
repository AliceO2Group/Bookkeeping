'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('log_lhc_fills', {
            log_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            fill_number: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('log_lhc_fills');
    },
};
