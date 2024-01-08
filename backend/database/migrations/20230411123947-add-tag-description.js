'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up(queryInterface, Sequelize) {
        return queryInterface.addColumn('tags', 'description', {
            allowNull: true,
            type: Sequelize.TEXT,
        });
    },
    // eslint-disable-next-line require-jsdoc
    async down(queryInterface) {
        return queryInterface.removeColumn('tags', 'description');
    },
};
