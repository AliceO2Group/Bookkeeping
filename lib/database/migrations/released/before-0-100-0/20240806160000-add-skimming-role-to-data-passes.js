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

'use strict';

const { Sequelize } = require('sequelize');
const { SKIMMING_STAGES, SkimmingStage } = require('../../../../domain/enums/SkimmingStage.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('data_passes', 'skimming_stage', {
            type: Sequelize.ENUM(...SKIMMING_STAGES),
            allowNull: true,
        });

        await queryInterface.sequelize.query(`
            UPDATE data_passes
            SET skimming_stage = :skimmingStage
            WHERE name LIKE '%skimming%'
        `, { transaction, replacements: { skimmingStage: SkimmingStage.SKIMMING } });

        const numberedSkimmedPassesQuery = `
            SELECT
                id,
                ROW_NUMBER() OVER ( PARTITION BY lhc_period_id ORDER BY name ASC ) AS skimmed_production_rank
            FROM data_passes
            WHERE name LIKE '%pass%skimmed%'
        `;

        await queryInterface.sequelize.query(`
            UPDATE data_passes as dp
            INNER JOIN (
                WITH skimmed_productions_window AS (${numberedSkimmedPassesQuery})
                SELECT id
                FROM skimmed_productions_window
                WHERE skimmed_production_rank = 1
            ) AS first_skimmed
                ON first_skimmed.id = dp.id

            SET dp.skimming_stage = :skimmingStage
        `, { transaction, replacements: { skimmingStage: SkimmingStage.SKIMMED } });

        await queryInterface.sequelize.query(`
        UPDATE data_passes as dp
        INNER JOIN (
            WITH skimmed_productions_window AS (${numberedSkimmedPassesQuery})
            SELECT id
            FROM skimmed_productions_window
            WHERE skimmed_production_rank > 1
        ) AS later_skimmed
            ON later_skimmed.id = dp.id

        SET dp.skimming_stage = :skimmingStage
    `, { transaction, replacements: { skimmingStage: SkimmingStage.POST_SKIMMED } });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('data_passes', 'skimming_stage', { transaction });
    }),
};
