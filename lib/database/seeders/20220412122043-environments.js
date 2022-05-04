'use strict';

module.exports = {
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('environments', [
        {
            id: 'Dxi029djX',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'RUNNING',
            status_message: 'Running fine...',
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'TDI59So3d',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'MIXED',
            status_message: 'Some problems in the runs',
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'EIDO13i3D',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'ERROR',
            status_message: 'This one is really broken',
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'KGIS12DS',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'CONFIGURED',
            status_message: 'Ready to deploy',
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'VODdsO12d',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'DEPLOYED',
            status_message: '',
            updated_at: new Date('2019-08-09'),
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('environments', null, {}),
};
