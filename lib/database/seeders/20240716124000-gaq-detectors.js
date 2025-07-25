'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction((transaction) => Promise.all([
        queryInterface.bulkInsert('global_aggregated_quality_detectors', [
            {
                data_pass_id: 3,
                run_number: 56,
                detector_id: 4,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },
            {
                data_pass_id: 3,
                run_number: 56,
                detector_id: 7,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },

            {
                run_number: 54,
                data_pass_id: 3,
                detector_id: 4,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },

            {
                run_number: 106,
                data_pass_id: 1,
                detector_id: 1,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },
            {
                run_number: 106,
                data_pass_id: 1,
                detector_id: 2,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },

            {
                run_number: 107,
                data_pass_id: 1,
                detector_id: 1,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },
            {
                run_number: 107,
                data_pass_id: 1,
                detector_id: 2,

                created_at: '2024-07-16 12:45:00',
                updated_at: '2024-07-16 12:45:00',
            },
        ], { transaction }),
    ])),

    down: async (queryInterface) => queryInterface.sequelize.transaction((transaction) =>
        queryInterface.bulkDelete('global_aggregated_quality_detectors', null, { transaction })),
};
