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
            from: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            to: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            comment: {
                type: Sequelize.TEXT,
            },

            // Associations
            created_by_id: {
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
            detector_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'dpl_detectors',
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

        await queryInterface.createTable('data_pass_quality_control_flag', {
            data_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'data_passes',
                    key: 'id',
                },
            },
            quality_control_flag_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'quality_control_flags',
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

        await queryInterface.createTable('simulation_pass_quality_control_flag', {
            simulation_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'simulation_passes',
                    key: 'id',
                },
            },
            quality_control_flag_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'quality_control_flags',
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
        await queryInterface.dropTable('data_pass_quality_control_flag', { transaction });
        await queryInterface.dropTable('simulation_pass_quality_control_flag', { transaction });
        await queryInterface.dropTable('quality_control_flags', { transaction });
        await queryInterface.dropTable('quality_control_flag_reasons', { transaction });
    }),
};
