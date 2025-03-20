'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction((transaction) => Promise.all([
        queryInterface.bulkInsert('ctp_trigger_counters', [
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
            {
                id: 3,
                timestamp: '2024-06-03 14:45:12',
                run_number: 54,
                class_name: 'C1ZNC-B-NOPF-CRU',
                lmb: 5748831462n,
                lma: 5748757057n,
                l0b: 5748757057n,
                l0a: 5748757056n,
                l1b: 5748757056n,
                l1a: 5748757056n,
                created_at: '2024-06-03 14:48:01',
                updated_at: '2024-06-03 14:50:48',
            },
            {
                id: 4,
                timestamp: '2024-06-03 14:45:12',
                run_number: 108,
                class_name: 'CMTVX-NONE-NOPF-CRU',
                lmb: 61766221961n,
                lma: 0,
                l0b: 15944142517n,
                l0a: 15942608365n,
                l1b: 1141098293n,
                l1a: 1141098293n,
                created_at: '2024-06-03 14:48:01',
                updated_at: '2024-06-03 14:50:48',
            },
        ], { transaction }),
    ])),

    down: async (queryInterface) => queryInterface.sequelize.transaction((transaction) =>
        queryInterface.bulkDelete('ctp_trigger_counters', null, { transaction })),
};
