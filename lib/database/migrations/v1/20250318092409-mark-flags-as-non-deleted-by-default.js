'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => await queryInterface.changeColumn(
        'quality_control_flags',
        'deleted',
        {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'id',
        },
    ),

    down: async (queryInterface, Sequelize) => await queryInterface.changeColumn(
        'quality_control_flags',
        'deleted',
        {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            after: 'id',
        },
    ),
};
