'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: (queryInterface) => queryInterface.addIndex('runs', {
        fields: ['env_id'],
        name: 'idx_runs_env_id',
    }),

    down: (queryInterface) => queryInterface.removeIndex('runs', 'idx_runs_env_id'),
};
