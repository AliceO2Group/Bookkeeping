'use strict';

module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up(queryInterface, _Sequelize) {
        queryInterface.addConstraint('runs', {
            fields: ['run_number'],
            type: 'unique',
            name: 'unique_run_number_run',
        });
    },

    // eslint-disable-next-line require-jsdoc
    async down(queryInterface, _Sequelize) {
        queryInterface.removeConstraint('runs', 'unique_run_number_run');
    },
};
