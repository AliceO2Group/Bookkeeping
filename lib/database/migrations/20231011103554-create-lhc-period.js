'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        // return;
        const { sequelize } = queryInterface;
        const lhcPeriodsTableName = 'lhc_periods';
        const stdLHCPeriodRegEx = /((LHC)|(lhc))\d\d[a-zA-Z]+/;
        await queryInterface.createTable(lhcPeriodsTableName, {
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
            year: {
                type: Sequelize.INTEGER,
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
                model: lhcPeriodsTableName,
                key: 'id',
            },
            allowNull: true,
        }, { transaction });

        const periodsToBeCreated = (await sequelize.query(
            'SELECT DISTINCT lhc_period from runs',
            { transaction },
        ))[0]
            .map(({ lhc_period }) => lhc_period)
            .filter((_) => _);

        const stdPeriods = periodsToBeCreated
            .filter((lhcPeriodName) => stdLHCPeriodRegEx.test(lhcPeriodName))
            .map((lhcPeriodName) => ({
                name: lhcPeriodName,
                year: Number(lhcPeriodName.slice(3, 5)) + 2000,
            }));

        await queryInterface.bulkInsert(lhcPeriodsTableName, stdPeriods, { transaction });
        const [createdPeriodsData] = await sequelize.query(
            `SELECT id, name from ${lhcPeriodsTableName}`,
            { transaction },
        );
        const createdPeriodsLookup = Object.fromEntries(createdPeriodsData.map(({ id, name }) => [name, id]));

        const [runsData] = await sequelize.query('SELECT run_number, lhc_period from runs', { transaction });
        const newRunsData = runsData
            .filter(({ lhc_period }) => stdLHCPeriodRegEx.test(lhc_period))
            .map(({ run_number, lhc_period }) => ({
                run_number,
                lhc_period_id: createdPeriodsLookup[lhc_period],
            }));
        const upsertStmt = `
        INSERT INTO runs(run_number, lhc_period_id) 
        VALUES ${newRunsData.map(({ run_number, lhc_period_id }) => `(${run_number},${lhc_period_id})`).join(',')}
        ON DUPLICATE KEY UPDATE
            lhc_period_id = VALUES(lhc_period_id);
        `;

        console.log('TOBECERTAIN', `<<<${upsertStmt}>>>`);

        await sequelize.query(upsertStmt, { transaction });
        await queryInterface.removeColumn('runs', 'lhc_period', { transaction });
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        queryInterface.removeColumn('runs', 'lhc_period_id', { transaction });
    }),
};
