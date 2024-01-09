'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('data_passes', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            output_size: {
                type: Sequelize.BIGINT,
            },
            reconstructed_events_count: {
                type: Sequelize.INTEGER,
            },
            last_run_number: {
                type: Sequelize.INTEGER,
            },
            lhc_period_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'lhc_periods',
                    key: 'id',
                },
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
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('data_passes', { transaction });
    }),
};
