/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { DataPassVersionStatus } = require('../../domain/enums/DataPassVersionStatus');
const { SkimmingStage } = require('../../domain/enums/SkimmingStage');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert('data_passes', [

                /** LHC22b (proton-proton)*/
                {
                    id: 1,
                    name: 'LHC22b_apass1',
                    skimming_stage: SkimmingStage.SKIMMABLE,
                    lhc_period_id: 2,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 2,
                    name: 'LHC22b_skimming',
                    skimming_stage: SkimmingStage.SKIMMING,
                    lhc_period_id: 2,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 5,
                    name: 'LHC22b_apass2_skimmed',
                    skimming_stage: SkimmingStage.SKIMMED,
                    lhc_period_id: 2,
                    created_at: '2024-02-15 12:00:00',
                    updated_at: '2024-02-15 12:00:00',
                },

                /** LHC22a (PbPb) */
                {
                    id: 3,
                    name: 'LHC22a_apass1',
                    lhc_period_id: 1,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 4,
                    name: 'LHC22a_apass2',
                    lhc_period_id: 1,
                    created_at: '2024-02-11 10:00:00',
                    updated_at: '2024-02-11 10:00:00',
                },
            ], { transaction });

            await queryInterface.bulkInsert('data_pass_versions', [
                {
                    id: 1,
                    data_pass_id: 1,
                    description: 'Some random desc',
                    reconstructed_events_count: 50948694,
                    output_size: 56875682112600,
                    last_seen: 108,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 2,
                    data_pass_id: 2,
                    description: 'desc LHC24b skimming',
                    reconstructed_events_count: 50848604,
                    output_size: 55765671112610,
                    last_seen: 55,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 3,
                    data_pass_id: 3,
                    description: 'Some random desc for apass 1',
                    reconstructed_events_count: 50848111,
                    output_size: 55761110122610,
                    last_seen: 105,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },

                {
                    id: 4,
                    data_pass_id: 4,
                    description: 'LHC22a',
                    last_seen: 105,
                    created_at: '2024-02-11 10:00:00',
                    updated_at: '2024-02-11 10:00:00',
                },
                {
                    id: 5,
                    data_pass_id: 5,
                    description: 'LHC22b skimmed',
                    last_seen: 105,
                    created_at: '2024-02-15 12:00:00',
                    updated_at: '2024-02-15 12:00:00',
                },
            ], { transaction }),

            await queryInterface.bulkInsert('data_pass_version_status_history', [

                /**
                 * In Bkp/RCT whole history of data_pass's processing is stored
                 */
                /** Data pass version of LHC22b_apass1 was running on MonAlisa but was deleted */
                {
                    id: 1,
                    data_pass_version_id: 1,
                    status: DataPassVersionStatus.RUNNING,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 2,
                    data_pass_version_id: 1,
                    status: DataPassVersionStatus.DELETED,
                    created_at: '2024-01-10 11:11:00',
                    updated_at: '2024-01-10 11:11:00',
                },

                /** Data pass version of LHC22b_apass2 was restarted on MonAlisa */
                {
                    id: 3,
                    data_pass_version_id: 2,
                    status: DataPassVersionStatus.RUNNING,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 4,
                    data_pass_version_id: 2,
                    status: DataPassVersionStatus.DELETED,
                    created_at: '2024-01-10 11:02:00',
                    updated_at: '2024-01-10 11:02:00',
                },
                {
                    id: 5,
                    data_pass_version_id: 2,
                    status: DataPassVersionStatus.RUNNING,
                    created_at: '2024-01-10 11:09:00',
                    updated_at: '2024-01-10 11:09:00',
                },

                /** Data pass version of LHC22a_apass1 was delete from MonAlisa */
                {
                    id: 6,
                    data_pass_version_id: 3,
                    status: DataPassVersionStatus.RUNNING,
                    created_at: '2024-01-10 11:00:00',
                    updated_at: '2024-01-10 11:00:00',
                },
                {
                    id: 7,
                    data_pass_version_id: 3,
                    status: DataPassVersionStatus.DELETED,
                    created_at: '2024-01-10 11:12:00',
                    updated_at: '2024-01-10 11:12:00',
                },

                /** Data pass version of LHC22a_skimming was deleted from MonAlisa */
                {
                    id: 8,
                    data_pass_version_id: 4,
                    status: DataPassVersionStatus.RUNNING,
                    created_at: '2024-02-11 10:30:00',
                    updated_at: '2024-02-11 10:30:00',
                },
                {
                    id: 9,
                    data_pass_version_id: 4,
                    status: DataPassVersionStatus.DELETED,
                    created_at: '2024-02-11 11:30:00',
                    updated_at: '2024-02-11 11:30:00',
                },

                /** Data pass version of LHC22a_skimmed is running on MonAlisa */
                {
                    id: 10,
                    data_pass_version_id: 5,
                    status: DataPassVersionStatus.RUNNING,
                    created_at: '2024-02-15 12:30:00',
                    updated_at: '2024-02-15 12:30:00',
                },
            ], { transaction }),

            await queryInterface.bulkInsert('data_passes_runs', [
                { data_pass_id: 1, run_number: 106, ready_for_skimming: true },
                { data_pass_id: 1, run_number: 107, ready_for_skimming: false },
                { data_pass_id: 1, run_number: 108, ready_for_skimming: false },
                { data_pass_id: 2, run_number: 1 },
                { data_pass_id: 2, run_number: 2 },
                { data_pass_id: 2, run_number: 55 },

                { data_pass_id: 3, run_number: 49 },
                { data_pass_id: 3, run_number: 54 },
                { data_pass_id: 3, run_number: 56 },
                { data_pass_id: 3, run_number: 105 },

                { data_pass_id: 4, run_number: 49 },
                { data_pass_id: 4, run_number: 54 },
                { data_pass_id: 4, run_number: 56 },
                { data_pass_id: 4, run_number: 105 },

                { data_pass_id: 5, run_number: 49 },
                { data_pass_id: 5, run_number: 54 },
                { data_pass_id: 5, run_number: 56 },
                { data_pass_id: 5, run_number: 105 },
            ], { transaction });
        }),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkDelete('data_pass_version_status_history', null, { transaction });
            await queryInterface.bulkDelete('data_passes_runs', null, { transaction });
            await queryInterface.bulkDelete('data_pass_versions', null, { transaction });
            await queryInterface.bulkDelete('data_passes', null, { transaction });
        }),
};
