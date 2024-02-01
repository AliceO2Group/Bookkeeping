'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('simulation_passes', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            description: {
                type: Sequelize.TEXT,
            },
            jira_id: {
                type: Sequelize.STRING,
            },
            pwg: { // Physicist working group
                type: Sequelize.TEXT,
            },
            requested_events_count: {
                type: Sequelize.REAL,
            },
            generated_events_count: {
                type: Sequelize.REAL,
            },
            output_size: {
                type: Sequelize.REAL,
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

        await queryInterface.createTable('simulation_pass_data_pass_anchors', {
            data_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: {
                    model: 'data_passes',
                    key: 'id',
                },
            },
            simulation_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: {
                    model: 'simulation_passes',
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

        await queryInterface.createTable('simulation_passes_runs', {
            simulation_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'simulation_passes',
                    key: 'id',
                },
            },
            run_number: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'runs',
                    key: 'run_number',
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
        await queryInterface.dropTable('simulation_passes', { transaction });
        await queryInterface.dropTable('simulation_pass_data_pass_anchors');
        await queryInterface.dropTable('simulation_passes_runs', { transaction });
    }),
};
