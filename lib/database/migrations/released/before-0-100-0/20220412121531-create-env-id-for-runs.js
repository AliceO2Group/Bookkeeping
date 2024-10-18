'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.addColumn('runs', 'env_id', { type: Sequelize.CHAR }, { transaction })])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.removeColumn('runs', 'env_id', { transaction })])),
};
