'use strict';

const { RunDefinition } = require('../../server/services/run/getRunDefinition');

const REMOVE_DATA_PASSES_LINKS_TO_NON_PHYSICS_RUNS = `
    DELETE FROM data_passes_runs
    WHERE run_number IN (
        SELECT run_number
        FROM runs as r
        WHERE r.definition != '${RunDefinition.Physics}')
    `;

const REMOVE_SIMULATION_PASSES_LINKS_TO_NON_PHYSICS_RUNS = `
    DELETE FROM simulation_passes_runs
    WHERE run_number IN (
        SELECT run_number
        FROM runs as r
        WHERE r.definition != '${RunDefinition.Physics}')
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
