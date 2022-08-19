'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.addColumn('runs', 'env_id', { type: Sequelize.CHAR }, { transaction })])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.removeColumn('runs', 'env_id', { transaction })])),
};
