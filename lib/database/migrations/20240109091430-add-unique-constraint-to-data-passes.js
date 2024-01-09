'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addConstraint('data_passes', {
            fields: 'name',
            type: 'unique',
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropConstraint('data_passes', {
            fields: 'name',
            type: 'unique',
        }, { transaction });
    }),
};
