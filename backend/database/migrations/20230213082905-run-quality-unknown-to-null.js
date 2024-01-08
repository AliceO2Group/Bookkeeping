'use strict';

const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.changeColumn('runs', 'run_quality', {
                type: Sequelize.ENUM('good', 'bad', 'test', 'unknown', 'none'),
                defaultValue: 'none',
            }, { transaction });
            await queryInterface.sequelize.models.Run.update(
                { runQuality: 'none' },
                {
                    where: {
                        [Op.or]: [
                            { runQuality: 'unknown' },
                            { runQuality: null },
                        ],
                    },
                    transaction,
                },
            );
            await queryInterface.changeColumn('runs', 'run_quality', {
                type: Sequelize.ENUM('good', 'bad', 'test', 'none'),
                defaultValue: 'none',
                allowNull: false,
            }, { transaction });
        });
    },

    // eslint-disable-next-line require-jsdoc
    async down(queryInterface, Sequelize) {
        queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.changeColumn('runs', 'run_quality', {
                type: Sequelize.ENUM('good', 'bad', 'test', 'unknown', 'none'),
                defaultValue: 'test',
                allowNull: true,
            }, { transaction });
            await queryInterface.sequelize.models.Run.update(
                { runQuality: null },
                { where: { runQuality: 'none' }, transaction },
            );
            await queryInterface.changeColumn('runs', 'run_quality', {
                type: Sequelize.ENUM('good', 'bad', 'unknown', 'test'),
                defaultValue: 'test',
                allowNull: true,
            }, { transaction });
        });
    },
};
