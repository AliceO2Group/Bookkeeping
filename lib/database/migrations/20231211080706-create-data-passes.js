'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('data_passes', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            outputSize: {
                type: Sequelize.REAL,
            },
            reconstructedEvents: {
                type: Sequelize.INTEGER,
            },
            lastRun: {
                type: Sequelize.INTEGER,
            },
            lhcPeriodId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'lhc_periods',
                    key: 'id',
                },
            },
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('data_passes', { transaction });
    }),
};
