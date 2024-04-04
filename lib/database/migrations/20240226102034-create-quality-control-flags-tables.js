'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('quality_control_flag_types', {
            // Properties
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            method: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            bad: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            archived_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },

            // Timestamps
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
        await queryInterface.dropTable('quality_control_flag_type', { transaction });
    }),
};
