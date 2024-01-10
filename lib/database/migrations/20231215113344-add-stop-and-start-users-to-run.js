'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.addColumn('runs', 'user_id_o2_start', {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
        });
        await queryInterface.addColumn('runs', 'user_id_o2_stop', {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
        });
        // Add FK constraints
        await queryInterface.addConstraint('runs', {
            fields: ['user_id_o2_start'],
            type: 'foreign key',
            name: 'fk_user_o2_start',
            references: {
                table: 'users',
                field: 'id',
            },
        });
        await queryInterface.addConstraint('runs', {
            fields: ['user_id_o2_stop'],
            type: 'foreign key',
            name: 'fk_user_o2_stop',
            references: {
                table: 'users',
                field: 'id',
            },
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.removeColumn('runs', 'user_id_o2_start');
        await queryInterface.removeColumn('runs', 'user_id_o2_stop');

        // Delete fk constraints
        await queryInterface.removeConstraint('runs', 'fk_user_o2_start');
        await queryInterface.removeConstraint('runs', 'fk_user_o2_stop');
    }),
};
