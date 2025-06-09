'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn('tags', 'archived_at', {
                type: Sequelize.DataTypes.DATE,
                allowNull: true,
                default: null,
            }, { transaction });

            await queryInterface.addIndex(
                'tags',
                {
                    name: 'tags_unique_text_archived_at',
                    unique: true,
                    fields: ['text', 'archived_at'],
                    transaction,
                },
            );
        });
    },

    down: async (queryInterface) => {
        queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.removeIndex('tags', 'tags_unique_text_archived_at', { transaction });
            await queryInterface.removeColumn('tags', 'archived_at', { transaction });
        });
    },
};
