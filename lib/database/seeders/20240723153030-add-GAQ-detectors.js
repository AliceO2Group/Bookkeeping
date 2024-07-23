'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction((transaction) => Promise.all([
        queryInterface.bulkInsert('global_aggregated_quality_detectors;', [
            {
                run_number: 106,
                data_passi_id: 1,
                dpl_detector_id: 1,
            },
            {
                run_number: 106,
                data_passi_id: 1,
                dpl_detector_id: 2,
            },
        ], { transaction }),
    ])),

    down: async (queryInterface) => queryInterface.sequelize.transaction((transaction) =>
        queryInterface.bulkDelete('global_aggregated_quality_detectors;', null, { transaction })),
};
