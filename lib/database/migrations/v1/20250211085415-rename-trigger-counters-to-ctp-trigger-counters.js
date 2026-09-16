'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => await queryInterface.sequelize.query('RENAME TABLE trigger_counters TO ctp_trigger_counters', { type: QueryTypes.RAW }),

    down: async (queryInterface) => queryInterface.sequelize.query('RENAME TABLE ctp_trigger_counters TO trigger_counters', { type: QueryTypes.RAW }),
};
