'use strict';

module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.addConstraint('runs', {
                    fields: ['run_number'],
                    type: 'unique',
                    name: 'unique_run_number_run',
                }, { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.removeConstraint('runs', 'unique_run_number_run', { transaction })])),
};
