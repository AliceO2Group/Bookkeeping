'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.addColumn('runs', 'user_id_o2_start', {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
            // Add fk constraint
            references: {
                model: 'users',
                field: 'id',
            },
        });
        await queryInterface.addColumn('runs', 'user_id_o2_stop', {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
            // Add fk constraint
            references: {
                model: 'users',
                field: 'id',
            },
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.removeColumn('runs', 'user_id_o2_start');
        await queryInterface.removeColumn('runs', 'user_id_o2_stop');
    }),
};
