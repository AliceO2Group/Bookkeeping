'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.addColumn('tags', 'color', {
            allowNull: true,
            type: Sequelize.STRING(7),
            default: null,
            validate: {
                len: 7,
            },
        });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.removeColumn('tags', 'color');
    }),
};
