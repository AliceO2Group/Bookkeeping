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
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('environments', [
                    // Running
                    {
                        id: 'CmCvjNbg',
                        created_at: new Date('2019-08-09 20:00:00'),
                        updated_at: new Date('2019-08-09 20:05:00'),
                        raw_configuration: JSON.stringify({
                            detectors: '["FT0", "ITS"]',
                            hosts: '["fake-flp1", "fake-flp2"]',
                            trg_global_run_enabled: 'true',
                            trg_enabled: 'true',
                            run_type: 'PHYSICS',
                            dd_enabled: 'true',
                            dcs_enabled: 'true',
                            odc_enabled: 'true',
                            pdp_config_option: 'Repository hash',
                            pdp_topology_description_library_file: 'production/production.desc',
                            pdp_workflow_parameters: 'QC,GPU,CALIB,EVENT_DISPLAY',
                            tfb_dd_mode: 'physics',
                            lhc_period: 'new',
                            odc_topology_fullname: '(hash, default, production/production.desc, synchronous-workflow-calib)',
                            pdp_beam_type: 'pp',
                            odc_topology: 'topology',
                            odc_n_epns: '2',
                            readout_cfg_uri: 'file:///local/replay/2024-04-17-pp-650khz-synt-4tf/readout-replay-24g-dd40.cfg',
                        }),
                    },
                    // Destroyed
                    {
                        id: 'TDI59So3d',
                        created_at: new Date('2019-08-09 16:05:00'),
                        updated_at: new Date('2019-08-09 19:00:00'),
                    },
                    // Error
                    {
                        id: 'EIDO13i3D',
                        created_at: new Date('2019-08-09 15:50:00'),
                        updated_at: new Date('2019-08-09 16:00:00'),
                    },
                    // Error then destroyed
                    {
                        id: 'KGIS12DS',
                        created_at: new Date('2019-08-09 14:45:00'),
                        updated_at: new Date('2019-08-09 15:35:00'),
                    },
                    // Destroyed (only state)
                    {
                        id: 'VODdsO12d',
                        created_at: new Date('2019-08-09 14:30:00'),
                        updated_at: new Date('2019-08-09 14:30:00'),
                    },
                    // Destroyed
                    {
                        id: 'GIDO1jdkD',
                        created_at: new Date('2019-08-09 14:00:00'),
                        updated_at: new Date('2019-08-09 14:10:00'),
                    },
                    // Error
                    {
                        id: '8E4aZTjY',
                        created_at: new Date('2019-08-09 12:30:00'),
                        updated_at: new Date('2019-08-09 12:35:00'),
                    },
                    // Still running
                    {
                        id: 'Dxi029djX',
                        raw_configuration: JSON.stringify({ ccdb_enabled: true, dcs_enabled: false }),
                        created_at: new Date('2019-08-09 12:00:00'),
                        updated_at: new Date('2019-08-09 12:00:00'),
                    },
                    // Deployed
                    {
                        id: 'eZF99lH6',
                        created_at: new Date('2019-05-09 13:00:00'),
                        updated_at: new Date('2019-05-09 13:00:00'),
                    },
                ], { transaction }),
            ])),
    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('environments', null, { transaction })])),
};
