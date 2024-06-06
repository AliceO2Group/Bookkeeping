'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction((transaction) => Promise.all([
        queryInterface.bulkInsert('trigger_counters', [
            {
                id: 1,
                timestamp: '2024-06-03 14:45:12',
                run_number: 1,
                class_name: 'FIRST-CLASS-NAME',
                lmb: 101n,
                lma: 102n,
                l0b: 103n,
                l0a: 104n,
                l1b: 105n,
                l1a: 106n,
                created_at: '2024-06-03 14:45:12',
                updated_at: '2024-06-03 14:45:12',
            },
            {
                id: 2,
                timestamp: '2024-06-03 14:45:12',
                run_number: 1,
                class_name: 'SECOND-CLASS-NAME',
                lmb: 2001n,
                lma: 2002n,
                l0b: 2003n,
                l0a: 2004n,
                l1b: 2005n,
                l1a: 2006n,
                created_at: '2024-06-03 14:46:27',
                updated_at: '2024-06-03 14:49:44',
            },
        ], { transaction }),
    ])),

    down: async (queryInterface) => queryInterface.sequelize.transaction((transaction) =>
        queryInterface.bulkDelete('trigger_counters', null, { transaction })),
};
