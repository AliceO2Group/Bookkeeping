'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.createTable('trigger_counters', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            timestamp: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            run_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'runs',
                    key: 'run_number',
                },
            },
            class_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            lmb: {
                type: Sequelize.BIGINT,
                allowNull: false,
                comment: 'LM before vetoes',
            },
            lma: {
                type: Sequelize.BIGINT,
                allowNull: false,
                comment: 'LM after vetoes',
            },
            l0b: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            l0a: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            l1b: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            l1a: {
                type: Sequelize.BIGINT,
                allowNull: false,
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

        await queryInterface.addConstraint('trigger_counters', {
            fields: ['run_number', 'class_name'],
            type: 'unique',
        });
    }),

    down: async (queryInterface) => queryInterface.dropTable('log_runs'),
};
