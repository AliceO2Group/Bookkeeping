'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn(
            'environments_history_items',
            'timestamp',
            {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { transaction },
        );
        await queryInterface.addColumn(
            'environments_history_items',
            'timestamp_nano',
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            { transaction },
        );

        const FILL_ENVIRONMENT_HISTORY_ITEMS_TIMESTAMPS = 'UPDATE environments_history_items SET timestamp = created_at';

        await queryInterface.sequelize.query(
            FILL_ENVIRONMENT_HISTORY_ITEMS_TIMESTAMPS,
            { transaction },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn(
            'environments_history_items',
            'timestamp',
            { transaction },
        );
        await queryInterface.removeColumn(
            'environments_history_items',
            'timestamp_nano',
            { transaction },
        );
    }),
};
