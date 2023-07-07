'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => {
        Promise.all([
            queryInterface.bulkInsert('dpl_processes_executions', [
                { id: 1, run_number: 105, detector_id: 1, process_id: 1, host_id: 1 },
                { id: 2, run_number: 106, detector_id: 1, process_id: 1, host_id: 1, args: '-f config.yml' },
                { id: 3, run_number: 106, detector_id: 1, process_id: 1, host_id: 2, args: '-- -u username' },
                { id: 4, run_number: 106, detector_id: 1, process_id: 2, host_id: 2 },
                { id: 5, run_number: 106, detector_id: 1, process_id: 3, host_id: 3, args: '-v' },
                { id: 6, run_number: 106, detector_id: 2, process_id: 1, host_id: 1, args: 'output' },
            ]),
        ]);
    },

    down: (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('dpl_processes_executions', null, { transaction })])),
};
