'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('quality_control_flag_reasons', {
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

        await queryInterface.createTable('quality_control_flags', {
            // Properties
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            time_start: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            time_end: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            comment: {
                type: Sequelize.TEXT,
            },
            provenance: {
                type: Sequelize.ENUM('HUMAN', 'SYNC', 'ASYNC', 'MC'),
                allowNull: false,
            },

            // Associations
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            flag_reason_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'quality_control_flag_reasons',
                    key: 'id',
                },
            },
            run_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'runs',
                    key: 'run_number',
                },
            },
            data_pass_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'data_passes',
                    key: 'id',
                },
            },
            detector_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'detectors',
                    key: 'id',
                },
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
        await queryInterface.dropTable('quality_control_flags', { transaction });
        await queryInterface.dropTable('quality_control_flag_reasons', { transaction });
    }),
};
