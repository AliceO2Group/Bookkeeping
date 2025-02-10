'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => await queryInterface.addColumn(
        'runs',
        'trigger_raw_configuration',
        {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
            default: null,
            after: 'trigger_acceptance',
        },
    ),

    down: async (queryInterface) => await queryInterface.removeColumn('runs', 'trigger_raw_configuration'),
};
