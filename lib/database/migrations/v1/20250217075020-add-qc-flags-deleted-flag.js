'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => await queryInterface.addColumn(
        'quality_control_flags',
        'deleted',
        {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            default: false,
            after: 'id',
        },
    ),

    down: async (queryInterface) => await queryInterface.removeColumn('quality_control_flags', 'deleted'),
};
