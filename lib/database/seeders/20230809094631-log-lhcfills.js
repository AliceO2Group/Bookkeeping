'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('log_lhcFills', [
                    {
                        logId: 1,
                        lhcFillNumber: 5,
                    },
                    {
                        logId: 1,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 2,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 3,
                        lhcFillNumber: 5,
                    },
                    {
                        logId: 3,
                        lhcFillNumber: 4,
                    },
                    {
                        logId: 4,
                        lhcFillNumber: 5,
                    },
                    {
                        logId: 4,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 4,
                        lhcFillNumber: 3,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 6,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 4,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 2,
                    },
                    {
                        logId: 119,
                        lhcFillNumber: 1,
                    },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_lhcFills', null, { transaction })])),
};
