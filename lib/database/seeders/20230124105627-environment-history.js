'use strict';

module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('environments_history_items', [
                    {
                        environment_id: 'CmCvjNbg',
                        status: 'DEPLOYED',
                        status_message: 'Environment has been deployed',
                        created_at: new Date('2019-08-09 20:00:00'),
                        updated_at: new Date('2019-08-09 20:00:00'),
                    },
                    {
                        environment_id: 'CmCvjNbg',
                        status: 'RUNNING',
                        status_message: 'Running fine...',
                        created_at: new Date('2019-08-09 20:05:00'),
                        updated_at: new Date('2019-08-09 20:05:00'),
                    },
                    {
                        environment_id: 'TDI59So3d',
                        status: 'CONFIGURED',
                        status_message: 'Environment configured',
                        created_at: new Date('2019-08-09 16:05:00'),
                        updated_at: new Date('2019-08-09 16:05:00'),
                    },
                    {
                        environment_id: 'TDI59So3d',
                        status: 'RUNNING',
                        status_message: 'Environment is running',
                        created_at: new Date('2019-08-09 17:00:00'),
                        updated_at: new Date('2019-08-09 17:00:00'),
                    },
                    {
                        environment_id: 'TDI59So3d',
                        status: 'STOPPED',
                        status_message: 'Environment has been stopped',
                        created_at: new Date('2019-08-09 18:00:00'),
                        updated_at: new Date('2019-08-09 18:00:00'),
                    },
                    {
                        environment_id: 'TDI59So3d',
                        status: 'DESTROYED',
                        status_message: 'Environment has been destroyed',
                        created_at: new Date('2019-08-09 19:00:00'),
                        updated_at: new Date('2019-08-09 19:00:00'),
                    },
                    {
                        environment_id: 'EIDO13i3D',
                        status: 'STANDBY',
                        status_message: 'Ready to deploy',
                        created_at: new Date('2019-08-09 15:50:00'),
                        updated_at: new Date('2019-08-09 15:50:00'),
                    },
                    {
                        environment_id: 'EIDO13i3D',
                        status: 'ERROR',
                        status_message: 'This one is really broken',
                        created_at: new Date('2019-08-09 16:00:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    {
                        environment_id: 'KGIS12DS',
                        status: 'STANDBY',
                        status_message: 'Ready to deploy',
                        created_at: new Date('2019-08-09 14:45:00'),
                        updated_at: new Date('2019-08-09 14:45:00'),
                    },
                    {
                        environment_id: 'KGIS12DS',
                        status: 'DEPLOYED',
                        status_message: 'Environment has been deployed',
                        created_at: new Date('2019-08-09 14:50:00'),
                        updated_at: new Date('2019-08-09 14:50:00'),
                    },
                    {
                        environment_id: 'KGIS12DS',
                        status: 'ERROR',
                        status_message: 'Environment has gone to error',
                        created_at: new Date('2019-08-09 15:30:00'),
                        updated_at: new Date('2019-08-09 15:30:00'),
                    },
                    {
                        environment_id: 'KGIS12DS',
                        status: 'DESTROYED',
                        status_message: 'Environment has been destroyed',
                        created_at: new Date('2019-08-09 15:35:00'),
                        updated_at: new Date('2019-08-09 15:35:00'),
                    },
                    {
                        environment_id: 'VODdsO12d',
                        status: 'DESTROYED',
                        status_message: 'Environment has been destroyed',
                        created_at: new Date('2019-08-09 14:30:00'),
                        updated_at: new Date('2019-08-09 14:30:00'),
                    },
                    {
                        environment_id: 'GIDO1jdkD',
                        status: 'DEPLOYED',
                        status_message: 'Environment has been deployed',
                        created_at: new Date('2019-08-09 14:00:00'),
                        updated_at: new Date('2019-08-09 14:00:00'),
                    },
                    {
                        environment_id: 'GIDO1jdkD',
                        status: 'CONFIGURED',
                        status_message: 'Environment configured',
                        created_at: new Date('2019-08-09 14:05:00'),
                        updated_at: new Date('2019-08-09 14:05:00'),
                    },
                    {
                        environment_id: 'GIDO1jdkD',
                        status: 'DESTROYED',
                        status_message: 'Environment has been destroyed',
                        created_at: new Date('2019-08-09 14:10:00'),
                        updated_at: new Date('2019-08-09 14:10:00'),
                    },
                    {
                        environment_id: '8E4aZTjY',
                        status: 'STANDBY',
                        status_message: 'Ready to deploy',
                        created_at: new Date('2019-08-09 12:30:00'),
                        updated_at: new Date('2019-08-09 12:30:00'),
                    },
                    {
                        environment_id: '8E4aZTjY',
                        status: 'ERROR',
                        status_message: 'Environment has gone to error',
                        created_at: new Date('2019-08-09 12:35:00'),
                        updated_at: new Date('2019-08-09 12:35:00'),
                    },
                    // Lost environment in Running state
                    {
                        environment_id: 'Dxi029djX',
                        status: 'RUNNING',
                        status_message: 'Running fine...',
                        created_at: new Date('2019-08-09 12:00:00'),
                        updated_at: new Date('2019-08-09 12:00:00'),
                    },
                    // Lost environment in deployed state long before the others
                    {
                        environment_id: 'eZF99lH6',
                        status: 'DEPLOYED',
                        status_message: 'Environment has been deployed',
                        created_at: new Date('2019-05-09 13:00:00'),
                        updated_at: new Date('2019-05-09 13:00:00'),
                    },
                ], { transaction }),
            ])),
    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('environments_history_items', null, { transaction })])),
};
