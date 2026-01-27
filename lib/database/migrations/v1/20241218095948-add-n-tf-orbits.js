'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => await queryInterface.addColumn(
        'runs',
        'n_tf_orbits',
        {
            type: Sequelize.DataTypes.BIGINT,
            allowNull: true,
            default: null,
            after: 'other_file_size',
        },
    ),

    down: async (queryInterface) => await queryInterface.removeColumn('runs', 'n_tf_orbits'),
};
