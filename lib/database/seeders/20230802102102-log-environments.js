'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('log_environments', [
                    {
                        log_id: 1,
                        environment_id: '8E4aZTjY',
                    },
                    {
                        log_id: 1,
                        environment_id: 'eZF99lH6',
                    },
                    {
                        log_id: 2,
                        environment_id: 'eZF99lH6',
                    },
                    {
                        log_id: 3,
                        environment_id: '8E4aZTjY',
                    },
                    {
                        log_id: 3,
                        environment_id: 'Dxi029djX',
                    },
                    {
                        log_id: 4,
                        environment_id: '8E4aZTjY',
                    },
                    {
                        log_id: 4,
                        environment_id: 'eZF99lH6',
                    },
                    {
                        log_id: 4,
                        environment_id: 'CmCvjNbg',
                    },
                    {
                        log_id: 119,
                        environment_id: 'eZF99lH6',
                    },
                    {
                        log_id: 119,
                        environment_id: 'Dxi029djX',
                    },
                    {
                        log_id: 119,
                        environment_id: 'GIDO1jdkD',
                    },
                    {
                        log_id: 119,
                        environment_id: 'VODdsO12d',
                    },
                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('log_environments', null, { transaction })])),
};
