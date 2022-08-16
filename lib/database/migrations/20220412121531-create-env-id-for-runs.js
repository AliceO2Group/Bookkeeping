'use strict';

module.exports = {
    up: async ({ context: { Sequelize, queryInterface } }) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('runs', 'env_id', { type: Sequelize.CHAR }, { transaction });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    down: async ({ context: { queryInterface } }) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('runs', 'env_id', { transaction });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
};
