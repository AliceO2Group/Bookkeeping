'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        const [{ count }] = await queryInterface.sequelize.query(
            'SELECT COUNT(*) count FROM subsystems',
            { type: QueryTypes.SELECT, transaction, raw: true },
        );

        // Put a security to avoid dropping subsystems if the table is not empty
        if (parseInt(count, 10)) {
            throw new Error('Subsystems table is not empty.' +
                ' If the table is filled with seeders, please manually truncate it then re-run migrations');
        }

        await queryInterface.dropTable('log_subsystems', { transaction });
        await queryInterface.dropTable('subsystems', { transaction });
    }),

    down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('subsystems', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
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

        await queryInterface.createTable('log_subsystems', {
            log_id: {
                primaryKey: true,
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            subsystem_id: {
                primaryKey: true,
                allowNull: false,
                type: Sequelize.INTEGER,
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
        }, { transaction })
            .then(() => queryInterface.addConstraint('log_subsystems', {
                fields: ['log_id'],
                type: 'foreign key',
                name: 'fk_log_id_log_subsystems',
                references: {
                    table: 'logs',
                    field: 'id',
                },
            }, { transaction }))
            .then(() => queryInterface.addConstraint('log_subsystems', {
                fields: ['subsystem_id'],
                type: 'foreign key',
                name: 'fk_subsystem_id_log_subsystems',
                references: {
                    table: 'subsystems',
                    field: 'id',
                },
            }, { transaction }));
    }),
};
