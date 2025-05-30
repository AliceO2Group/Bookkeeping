/*
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

const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');

const REMOVE_DATA_PASSES_LINKS_TO_NON_PHYSICS_RUNS = `
    DELETE dpr FROM data_passes_runs AS dpr
    INNER JOIN runs AS r
        ON r.run_number = dpr.run_number
        AND r.definition != '${RunDefinition.PHYSICS}'
    `;

const REMOVE_SIMULATION_PASSES_LINKS_TO_NON_PHYSICS_RUNS = `
    DELETE spr FROM simulation_passes_runs AS spr
    INNER JOIN runs AS r
        ON r.run_number = spr.run_number
        AND r.definition != '${RunDefinition.PHYSICS}'
    `;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(REMOVE_DATA_PASSES_LINKS_TO_NON_PHYSICS_RUNS, { transaction });
        await queryInterface.sequelize.query(REMOVE_SIMULATION_PASSES_LINKS_TO_NON_PHYSICS_RUNS, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.sequelize.query('SELECT \'THIS OPERTAION WAS IRREVERSIBLE\'');
    }),
};
