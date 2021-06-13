'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.addColumn('attachments', 'hash', {
            type: Sequelize.STRING,
            allowNull: false,
        }),

    down: async (queryInterface, _) => queryInterface.removeColumn('attachments', 'hash'),
};
