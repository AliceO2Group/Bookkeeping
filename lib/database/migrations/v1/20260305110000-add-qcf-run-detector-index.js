'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addIndex('quality_control_flags', {
            name: 'quality_control_flags_run_detector_idx',
            fields: ['run_number', 'detector_id'],
        }, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeIndex('quality_control_flags', 'quality_control_flags_run_detector_idx', { transaction });
    }),
};
