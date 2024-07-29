'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction((transaction) =>
        queryInterface.bulkInsert('global_aggregated_quality_detectors', [
            {
                run_number: 106,
                data_pass_id: 1,
                detector_id: 1,
            },
            {
                run_number: 106,
                data_pass_id: 1,
                detector_id: 2,
            },
        ], { transaction })),

    down: async (queryInterface) => queryInterface.sequelize.transaction((transaction) =>
        queryInterface.bulkDelete('global_aggregated_quality_detectors', null, { transaction })),
};
