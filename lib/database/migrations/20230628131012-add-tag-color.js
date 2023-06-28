'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up(queryInterface, Sequelize) {
        return queryInterface.addColumn('tags', 'color', {
            allowNull: true,
            type: Sequelize.STRING,
        });
    },
    // eslint-disable-next-line require-jsdoc
    async down(queryInterface) {
        return queryInterface.removeColumn('tags', 'color');
    },
};
