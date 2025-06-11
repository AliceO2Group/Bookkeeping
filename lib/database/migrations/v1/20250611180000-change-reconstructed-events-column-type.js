'use strict';

const MODIFY_COLUMN_TYPE = `
    ALTER TABLE data_pass_versions MODIFY reconstructed_events_count BIGINT UNSIGNED;
`;

const ROLLBACK_COLUMN_TYPE = `
    ALTER TABLE data_pass_versions MODIFY reconstructed_events_count INTEGER;
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(MODIFY_COLUMN_TYPE, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(ROLLBACK_COLUMN_TYPE, { transaction });
    }),
};
