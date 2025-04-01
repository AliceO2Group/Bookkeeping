'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => await queryInterface.addColumn(
        'data_passes',
        'frozen',
        {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    ),

    down: async (queryInterface) => await queryInterface.removeColumn('data_passes', 'frozen'),
};
