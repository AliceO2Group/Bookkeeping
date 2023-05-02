'use strict';

module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('dpl_processes_types', [
                    { id: 1, label: 'QcTask' },
                    { id: 2, label: 'QcChecker' },
                    { id: 3, label: 'QcAggregator' },
                    { id: 4, label: 'QcPostprocessing' },
                    { id: 5, label: 'Dispatcher' },
                    { id: 6, label: 'Merger' },
                ], { transaction }),
            ])),
    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('dpl_processes_types', null, { transaction })])),
};
