'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('gaq_summaries', {
            data_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'data_passes',
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
            bad_effective_run_coverage: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            explicitly_not_bad_effective_run_coverage: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            mc_reproducible: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            missing_verifications_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            undefined_quality_periods_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            computed_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
            },
        }, { transaction });

        await queryInterface.createTable('gaq_summary_invalidations', {
            data_pass_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'data_passes',
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
            invalidated_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('gaq_summary_invalidations', { transaction });
        await queryInterface.dropTable('gaq_summaries', { transaction });
    }),
};
