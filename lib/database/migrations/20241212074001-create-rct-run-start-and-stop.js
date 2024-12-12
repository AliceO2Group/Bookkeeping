'use strict';

const ADD_RUN_RCT_START_AND_STOP = `
    ALTER TABLE runs
        ADD COLUMN rct_time_start DATETIME(3) AS (COALESCE(first_tf_timestamp, time_trg_start, time_o2_start)) VIRTUAL AFTER time_start,
        ADD COLUMN rct_time_end   DATETIME(3) AS (COALESCE(last_tf_timestamp, time_trg_end, time_o2_end)) VIRTUAL AFTER rct_time_start;
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.query(ADD_RUN_RCT_START_AND_STOP),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('runs', 'rct_time_start', { transaction });
        await queryInterface.removeColumn('runs', 'rct_time_end', { transaction });
    }),
};
