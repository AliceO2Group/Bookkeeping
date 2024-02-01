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
            pwg: {
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

        await queryInterface.createTable('anchored_passes', {
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
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('simulation_passes', { transaction });
        await queryInterface.dropTable('anchored_passes');
    }),
};
