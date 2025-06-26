'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn(
            'runs',
            'first_tf_timestamp',
            { type: Sequelize.DATE, after: 'time_trg_end' },
            { transaction },
        );
        await queryInterface.addColumn(
            'runs',
            'last_tf_timestamp',
            { type: Sequelize.DATE, after: 'first_tf_timestamp' },
            { transaction },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('runs', 'first_tf_timestamp', { transaction });
        await queryInterface.removeColumn('runs', 'last_tf_timestamp', { transaction });
    }),
};
