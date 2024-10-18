'use strict';

const { QueryTypes } = require('sequelize');

const COUNT_DOUBLED_FLP_ROLES = `
    SELECT fro.id
    FROM flp_roles fro
             LEFT JOIN flp_runs fru ON fro.id = fru.flp_role_id
    GROUP BY fro.id
    HAVING COUNT(*) > 1
`;

const TRANSFER_RUN_ID_TO_FLP_ROLES = `
    UPDATE flp_roles fro
        INNER JOIN flp_runs fru ON fro.id = fru.flp_role_id
        INNER JOIN runs r ON fru.run_id = r.id
    SET fro.run_number = r.run_number
`;

const TRANSFER_RUN_ID_TO_FLP_RUNS = `
    INSERT INTO flp_runs (flp_role_id, run_id, created_at, updated_at)
    SELECT fr.id, r.id, fr.created_at, fr.updated_at
    FROM flp_roles fr
             INNER JOIN runs r ON r.run_number = fr.run_number
`;

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction(async (transaction) => {
            const doubledFlpRoles = await queryInterface.sequelize.query(COUNT_DOUBLED_FLP_ROLES, { type: QueryTypes.SELECT, transaction });
            if (doubledFlpRoles.length > 0) {
                throw Error('flp_roles table has entries linked multiple times in flp_runs or have entries not linked at all');
            }

            await queryInterface.addColumn('flp_roles', 'run_number', {
                type: Sequelize.INTEGER,
            }, { transaction });

            await queryInterface.addConstraint('flp_roles', {
                fields: ['run_number'],
                type: 'foreign key',
                name: 'fk_run_number_flp_roles',
                references: {
                    table: 'runs',
                    field: 'run_number',
                },
            }, { transaction });

            queryInterface.addConstraint('flp_roles', {
                fields: ['name', 'run_number'],
                type: 'unique',
                name: 'unique_name_run_number_flp_roles',
            }, { transaction });

            await queryInterface.sequelize.query(TRANSFER_RUN_ID_TO_FLP_ROLES, { transaction });

            await queryInterface.dropTable('flp_runs', { transaction });
        }),
    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('flp_runs', {
            flp_role_id: {
                primaryKey: true,
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            run_id: {
                primaryKey: true,
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
        await queryInterface.sequelize.query(TRANSFER_RUN_ID_TO_FLP_RUNS, { transaction });
        await queryInterface.removeConstraint('flp_roles', 'fk_run_number_flp_roles', { transaction });
        await queryInterface.removeConstraint('flp_roles', 'unique_name_run_number_flp_roles', { transaction });
        await queryInterface.removeColumn('flp_roles', 'run_number', { transaction });
    }),
};
