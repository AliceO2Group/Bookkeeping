'use strict';

/**
 * Create instances of lhc periods using values from column `runs`.`lhc_period`
 * and return mapping `lhc_periods`.`name` -> `lhc_periods`.`id`
 * @param {Object} seqeulizeEnv sequelize migration environment
 * @return {Object<string, number>} mapping
 */
const createAndGetPeriods = async ({ queryInterface, transaction }) => {
    const periodsToBeCreated = (await queryInterface.sequelize.query(
        'SELECT DISTINCT lhc_period from runs',
        { transaction },
    ))[0]
        .map(({ lhc_period }) => ({ name: lhc_period }))
        .filter((_) => _.name);

    if (periodsToBeCreated.length) {
        await queryInterface.bulkInsert('lhc_periods', periodsToBeCreated, { transaction });
    }
    const [createdPeriodsData] = await queryInterface.sequelize.query(
        `SELECT id, name from ${'lhc_periods'}`,
        { transaction },
    );
    return Object.fromEntries(createdPeriodsData.map(({ id, name }) => [name, id]));
};

/**
 * Prepare `runs` update statement
 * @param {Object<string, number>} createdPeriodsLookup mapping `lhc_periods`.`name` -> `lhc_periods`.`id`
 * @param {Object} seqeulizeEnv sequelize migration environment
 * @return {string} sql update statement
 */
const prepareRunsUpdateStatement = async (createdPeriodsLookup, { queryInterface, transaction }) => {
    const [runsData] = await queryInterface.sequelize.query('SELECT run_number, lhc_period from runs', { transaction });
    const newRunsData = runsData
        .filter(({ lhc_period }) => lhc_period)
        .map(({ run_number, lhc_period }) => ({
            run_number,
            lhc_period_id: createdPeriodsLookup[lhc_period],
        }));

    return newRunsData.length ? `
    INSERT INTO runs(run_number, lhc_period_id)
    VALUES ${newRunsData.map(({ run_number, lhc_period_id }) => `(${run_number},${lhc_period_id})`).join(',')}
    ON DUPLICATE KEY UPDATE
        lhc_period_id = VALUES(lhc_period_id);
    ` : '';
};

/**
 * Prepare `runs` update statement which undo changes
 * introduced by applying stmt from @see prepareRunsUpdateStatement
 * @param {Object} seqeulizeEnv sequelize migration environment
 * @return {string} sql update statement
 */
const prepareRunsUndoUpdateStatement = async ({ queryInterface, transaction }) => {
    const [newRunsData] = await queryInterface.sequelize.query(
        'SELECT r.run_number, p.name as lhc_period \
            FROM runs as r \
            INNER JOIN lhc_periods as p \
            ON p.id = r.lhc_period_id;',
        { transaction },
    );

    return newRunsData.length ? `
        INSERT INTO runs(run_number, lhc_period)
        VALUES ${newRunsData.map(({ run_number, lhc_period }) => `(${run_number},'${lhc_period}')`).join(',')}
        ON DUPLICATE KEY UPDATE
            lhc_period = VALUES(lhc_period);
        ` : '';
};

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
        const updateStmt = prepareRunsUpdateStatement(
            createAndGetPeriods({ queryInterface, transaction }),
            { queryInterface, transaction },
        );
        if (updateStmt) {
            await sequelize.query(updateStmt, { transaction });
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

        const undoUpdateStmt = prepareRunsUndoUpdateStatement({ queryInterface, transaction });
        if (undoUpdateStmt) {
            await sequelize.query(undoUpdateStmt, { transaction });
        }

        /*
         * Sequelize make commit after last query,
         * so utilizing current transaction in following ones cause failure,
         * therefore { transaction: undefined } is provided, but btw.
         * in mysql stmt like ALTER table are NOT a subjects for transactions
         */
        queryInterface.removeColumn('runs', 'lhc_period_id', { transaction: undefined });
        queryInterface.dropTable('lhc_periods', { transaction: undefined });
    }),
};
