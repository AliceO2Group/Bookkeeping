'use strict';

const { RunDefinition } = require('../../server/services/run/getRunDefinition');

const REMOVE_DATA_PASSES_LINKS_TO_NON_PHYSICS_RUNS = `
    DELETE dpr FROM data_passes_runs AS dpr
    INNER JOIN runs AS r
        ON r.run_number = dpr.run_number
        AND r.definition != '${RunDefinition.Physics}'
    `;

const REMOVE_SIMULATION_PASSES_LINKS_TO_NON_PHYSICS_RUNS = `
    DELETE spr FROM simulation_passes_runs AS spr
    INNER JOIN runs AS r
        ON r.run_number = spr.run_number
        AND r.definition != '${RunDefinition.Physics}'
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
