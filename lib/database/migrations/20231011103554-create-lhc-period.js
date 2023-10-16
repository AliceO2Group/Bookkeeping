'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('lhc_periods', {
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

        await queryInterface.addColumn('runs', 'lhc_period_id', {
            type: Sequelize.INTEGER,
            reference: {
                model: 'lhc_periods',
                key: 'id',
            },
            allowNull: true,
        }, { transaction });

        const insertPeriodsStmt = `
            INSERT INTO lhc_periods(name)
                SELECT DISTINCT lhc_period 
                FROM runs
                    WHERE lhc_period IS NOT NULL
            ON DUPLICATE KEY UPDATE name = values(name)
        `;
        await queryInterface.sequelize.query(insertPeriodsStmt);

        const updateRunsDataStmt = `
            INSERT INTO runs(run_number, lhc_period_id)
                SELECT r.run_number, p.id
                FROM runs as r
                INNER JOIN lhc_periods as p
                    ON p.name = r.lhc_period
            ON DUPLICATE KEY UPDATE lhc_period_id = values(lhc_period_id)
        `;
        await queryInterface.sequelize.query(updateRunsDataStmt);

        await queryInterface.removeColumn('runs', 'lhc_period', { transaction });
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('runs', 'lhc_period', {
            type: Sequelize.STRING,
            allowNull: true,
        }, { transaction });

        const updateRunsStmt = `
            INSERT INTO runs(run_number, lhc_period)
                SELECT r.run_number, p.name
                FROM runs as r
                LEFT JOIN lhc_periods as p
                    ON p.id = r.lhc_period_id
            ON DUPLICATE KEY UPDATE lhc_period = values(lhc_period)
        `;
        await queryInterface.sequelize.query(updateRunsStmt);

        await queryInterface.removeColumn('runs', 'lhc_period_id', { transaction });
        await queryInterface.dropTable('lhc_periods', { transaction });
    }),
};
