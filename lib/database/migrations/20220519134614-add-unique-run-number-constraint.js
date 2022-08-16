'use strict';

module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up({ context: { queryInterface } }) {
        queryInterface.addConstraint('runs', {
            fields: ['run_number'],
            type: 'unique',
            name: 'unique_run_number_run',
        });
    },

    // eslint-disable-next-line require-jsdoc
    async down({ context: { queryInterface } }) {
        queryInterface.removeConstraint('runs', 'unique_run_number_run');
    },
};
