'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => Promise.all([
        queryInterface.bulkInsert('hosts', [
            { id: 1, hostname: 'FLP-1' },
            { id: 2, hostname: 'FLP-2' },
            { id: 3, hostname: 'EPN-1-NUMA-1' },
        ]),
    ]),

    down: (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('hosts', null, { transaction })])),
};
