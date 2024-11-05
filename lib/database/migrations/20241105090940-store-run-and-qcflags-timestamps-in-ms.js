'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.changeColumn(
            'runs',
            'time_o2_start',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'time_trg_start',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'first_tf_timestamp',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'last_tf_timestamp',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'time_trg_end',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'time_o2_end',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'from',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'to',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'created_at',
            {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'updated_at',
            {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'from',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'to',
            {
                type: Sequelize.DATE(3),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'created_at',
            {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'updated_at',
            {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.changeColumn(
            'runs',
            'time_o2_start',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'time_trg_start',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'first_tf_timestamp',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'last_tf_timestamp',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'time_trg_end',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'runs',
            'time_o2_end',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'from',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'to',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'created_at',
            {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flags',
            'updated_at',
            {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'from',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'to',
            {
                type: Sequelize.DATE,
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'created_at',
            {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.changeColumn(
            'quality_control_flag_effective_periods',
            'updated_at',
            {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
    }),
};
