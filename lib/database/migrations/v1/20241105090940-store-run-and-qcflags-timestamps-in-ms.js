'use strict';

const TIME_START_END_TO_DATETIME_3 = `
    ALTER TABLE runs
        CHANGE COLUMN time_start time_start DATETIME(3) AS (COALESCE(time_trg_start, time_trg_end)) VIRTUAL,
        CHANGE COLUMN time_end time_end DATETIME(3) AS (COALESCE(time_trg_end, time_o2_end)) VIRTUAL;
`;

const TIME_START_END_TO_DATETIME = `
    ALTER TABLE runs
        CHANGE COLUMN time_start time_start DATETIME AS (COALESCE(time_trg_start, time_trg_end)) VIRTUAL,
        CHANGE COLUMN time_end time_end DATETIME AS (COALESCE(time_trg_end, time_o2_end)) VIRTUAL;
`;

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

        await queryInterface.sequelize.query(TIME_START_END_TO_DATETIME_3, { transaction });
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

        await queryInterface.sequelize.query(TIME_START_END_TO_DATETIME, { transaction });
    }),
};
