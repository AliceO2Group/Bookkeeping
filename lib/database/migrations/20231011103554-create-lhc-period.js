'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        const { sequelize } = queryInterface;

        // DB adjustments
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

        queryInterface.addColumn('runs', 'lhc_period_id', {
            type: Sequelize.INTEGER,
            reference: {
                model: 'lhc_periods',
                key: 'id',
            },
            allowNull: true,
        }, { transaction });

        // Data migration
        const periodsToBeCreated = (await sequelize.query(
            'SELECT DISTINCT lhc_period from runs',
            { transaction },
        ))[0]
            .map(({ lhc_period }) => ({ name: lhc_period }))
            .filter((_) => _.name);

        await queryInterface.bulkInsert('lhc_periods', periodsToBeCreated, { transaction });
        const [createdPeriodsData] = await sequelize.query(
            `SELECT id, name from ${'lhc_periods'}`,
            { transaction },
        );
        const createdPeriodsLookup = Object.fromEntries(createdPeriodsData.map(({ id, name }) => [name, id]));

        const [runsData] = await sequelize.query('SELECT run_number, lhc_period from runs', { transaction });
        const newRunsData = runsData
            .filter(({ lhc_period }) => lhc_period)
            .map(({ run_number, lhc_period }) => ({
                run_number,
                lhc_period_id: createdPeriodsLookup[lhc_period],
            }));

        const upsertStmt = newRunsData ? `
        INSERT INTO runs(run_number, lhc_period_id) 
        VALUES ${newRunsData.map(({ run_number, lhc_period_id }) => `(${run_number},${lhc_period_id})`).join(',')}
        ON DUPLICATE KEY UPDATE
            lhc_period_id = VALUES(lhc_period_id);
        ` : '';

        if (upsertStmt) {
            await sequelize.query(upsertStmt, { transaction });
        }

        // DB cleanup
        await queryInterface.removeColumn('runs', 'lhc_period', { transaction });
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        const { sequelize } = queryInterface;
        queryInterface.addColumn('runs', 'lhc_period', {
            type: Sequelize.STRING,
            allowNull: true,
        }, { transaction });

        const [newRunsData] = await sequelize.query(
            'SELECT r.run_number, p.name as lhc_period \
                FROM runs as r \
                INNER JOIN lhc_periods as p \
                ON p.id = r.lhc_period_id;',
            { transaction },
        );

        const upsertStmt = newRunsData.length ? `
            INSERT INTO runs(run_number, lhc_period) 
            VALUES ${newRunsData.map(({ run_number, lhc_period }) => `(${run_number},'${lhc_period}')`).join(',')}
            ON DUPLICATE KEY UPDATE
                lhc_period = VALUES(lhc_period);
            ` : '';

        if (upsertStmt) {
            await sequelize.query(upsertStmt, { transaction });
        }

        /*
         * Sequelize make commit after last query,
         * so utilizing current transaction in following ones cause failure,
         * therefore { transaction: undefined } is provided
         */
        queryInterface.removeColumn('runs', 'lhc_period_id', { transaction: undefined });
        queryInterface.dropTable('lhc_periods', { transaction: undefined });
    }),
};
