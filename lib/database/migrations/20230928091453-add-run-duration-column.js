'use strict';

const ADD_RUN_DURATION = `
    ALTER TABLE runs
        ADD COLUMN duration integer AS (TO_SECONDS(time_end) - TO_SECONDS(time_start)) VIRTUAL AFTER time_end;
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(ADD_RUN_DURATION, { transaction });
        await queryInterface.addIndex('runs', {
            name: 'runs_duration_idx',
            fields: ['duration'],
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeIndex('runs', 'runs_duration_idx', { transaction });
        await queryInterface.removeColumn('runs', 'duration', { transaction });
    }),
};
