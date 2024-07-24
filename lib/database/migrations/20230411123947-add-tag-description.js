'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.addColumn('tags', 'description', {
            allowNull: true,
            type: Sequelize.TEXT,
        }),
    down: async (queryInterface) =>
        queryInterface.removeColumn('tags', 'description'),
};
