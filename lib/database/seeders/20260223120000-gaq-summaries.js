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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.bulkInsert('gaq_summaries', [
        {
            data_pass_id: 1,
            run_number: 106,
            bad_run_coverage: 0,
            mc_reproducible_coverage: 0,
            missing_verifications_count: 3,
            undefined_quality_periods_count: 11,
            not_computable: 0,
            invalidated_at: null,
            created_at: '2026-06-29 13:09:09.382',
            updated_at: '2026-06-29 13:09:09.382',
        },
        {
            data_pass_id: 1,
            run_number: 107,
            bad_run_coverage: 0,
            explicitly_not_bad_run_coverage: 0.759654,
            mc_reproducible_coverage: 0.240346,
            missing_verifications_count: 3,
            undefined_quality_periods_count: 0,
            not_computable: 0,
            invalidated_at: null,
            created_at: '2026-06-29 13:09:09.382',
            updated_at: '2026-06-29 13:09:09.382',
        },
        {
            data_pass_id: 2,
            run_number: 1,
            bad_run_coverage: null,
            explicitly_not_bad_run_coverage: null,
            mc_reproducible_coverage: null,
            missing_verifications_count: null,
            undefined_quality_periods_count: null,
            not_computable: 1,
            invalidated_at: null,
            created_at: '2026-06-29 13:09:09.382',
            updated_at: '2026-06-29 13:09:09.382',
        },
        {
            data_pass_id: 4,
            run_number: 100,
            bad_run_coverage: null,
            explicitly_not_bad_run_coverage: null,
            mc_reproducible_coverage: null,
            missing_verifications_count: null,
            undefined_quality_periods_count: null,
            not_computable: 1,
            invalidated_at: null,
            created_at: '2026-06-29 13:09:09.382',
            updated_at: '2026-06-29 13:09:09.382',

        },
        {
            data_pass_id: 4,
            run_number: 105,
            bad_run_coverage: null,
            explicitly_not_bad_run_coverage: null,
            mc_reproducible_coverage: null,
            missing_verifications_count: null,
            undefined_quality_periods_count: null,
            not_computable: 1,
            invalidated_at: null,
            created_at: '2026-06-29 13:09:09.382',
            updated_at: '2026-06-29 13:09:09.382',
        },
    ]),
    down: async (queryInterface) => queryInterface.bulkDelete('gaq_summaries', null, {}),
};
