'use strict';

const INSERT_PERIODS_QUERY = `
    INSERT INTO lhc_periods(name)
        SELECT DISTINCT lhc_period
        FROM runs
            WHERE lhc_period IS NOT NULL
    `;

const UPDATE_RUNS_DATA_QUERY = `
    UPDATE runs AS r
        JOIN lhc_periods AS p
            ON p.name = r.lhc_period
    SET r.lhc_period_id = p.id
    `;

const UNDO_UPDATE_RUNS_DATA_QUERY = `
    UPDATE runs AS r
        JOIN lhc_periods AS p
            ON p.id = r.lhc_period_id
    SET r.lhc_period = p.name
    `;

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

        await queryInterface.sequelize.query(INSERT_PERIODS_QUERY);
        await queryInterface.sequelize.query(UPDATE_RUNS_DATA_QUERY);

        await queryInterface.removeColumn('runs', 'lhc_period', { transaction });
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('runs', 'lhc_period', {
            type: Sequelize.STRING,
            allowNull: true,
        }, { transaction });

        await queryInterface.sequelize.query(UNDO_UPDATE_RUNS_DATA_QUERY);

        await queryInterface.removeColumn('runs', 'lhc_period_id', { transaction });
        await queryInterface.dropTable('lhc_periods', { transaction });
    }),
};
