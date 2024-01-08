'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => Promise.all([
        queryInterface.bulkInsert('dpl_processes', [
            { id: 1, name: 'PROCESS-1', type_id: 1 },
            { id: 2, name: 'PROCESS-2', type_id: 1 },
            { id: 3, name: 'PROCESS-1', type_id: 2 },
        ]),
    ]),

    down: (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('dpl_processes', null, { transaction })])),
};
