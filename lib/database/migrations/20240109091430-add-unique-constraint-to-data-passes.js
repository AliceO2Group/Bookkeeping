'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addConstraint('data_passes', {
            type: 'unique',
            fields: ['name'],
            name: 'data_pass_unique_name',
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeConstraint('data_passes', 'data_pass_unique_name', { transaction });
    }),
};
