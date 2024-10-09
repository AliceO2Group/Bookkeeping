'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn(
            'runs',
            'first_tf_timestamp',
            { type: Sequelize.DATE },
            { transaction, after: 'time_trg_end' },
        );
        await queryInterface.addColumn(
            'runs',
            'last_tf_timestamp',
            { type: Sequelize.DATE },
            { transaction, after: 'first_tf_timestamp' },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn('runs', 'first_tf_timestamp', { transaction });
        await queryInterface.removeColumn('runs', 'last_tf_timestamp', { transaction });
    }),
};
