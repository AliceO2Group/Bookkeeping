'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: (queryInterface) => queryInterface.addConstraint('environments_history_items', {
        fields: ['environment_id'],
        type: 'foreign key',
        name: 'fk_environments_history_items_environment_id',
        references: {
            table: 'environments',
            field: 'id',
        },
    }),

    down: (queryInterface) => queryInterface.removeConstraint(
        'environments_history_items',
        'fk_environments_history_items_environment_id',
    ),
};
