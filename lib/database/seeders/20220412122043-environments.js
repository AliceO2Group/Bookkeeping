/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

'use strict';

module.exports = {
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('environments', [
        {
            id: 'Dxi029djX',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'RUNNING',
            status_message: 'Running fine...',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 15:00:00'),
        },
        {
            id: 'TDI59So3d',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'MIXED',
            status_message: 'Some problems in the runs: environment crashed, configuration failed after restart, logs incomplete or corrupted',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09 16:00:00'),
        },
        {
            id: 'EIDO13i3D',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'ERROR',
            status_message: 'This one is really broken',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'KGIS12DS',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'CONFIGURED',
            status_message: 'Ready to deploy',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'VODdsO12d',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'DEPLOYED',
            status_message: '',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09'),
        },
        {
            id: 'GIDO1jdkD',
            toredown_at: new Date('2019-08-09 13:00:00'),
            status: 'DEPLOYED',
            status_message: '',
            created_at: new Date('2019-08-09'),
            updated_at: new Date('2019-08-09'),
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('environments', null, {}),
};
