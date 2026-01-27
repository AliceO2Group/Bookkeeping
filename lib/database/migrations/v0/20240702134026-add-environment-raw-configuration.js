'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.addColumn(
        'environments',
        'raw_configuration',
        { type: Sequelize.TEXT },
    ),

    down: async (queryInterface) => queryInterface.removeColumn(
        'environments',
        'raw_configuration',
    ),
};
