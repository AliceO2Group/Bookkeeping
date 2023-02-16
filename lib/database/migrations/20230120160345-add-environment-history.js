'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async () => {
            await queryInterface.createTable('environments_history_items', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                environment_id: {
                    type: Sequelize.CHAR(32),
                },
                status: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                status_message: {
                    type: Sequelize.TEXT,
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                },
            }, {
                timestamps: true,
            });

            // Convert status and status message to the new history table
            await queryInterface.sequelize.query(`
                INSERT INTO environments_history_items(environment_id, status, status_message, created_at, updated_at)
                SELECT id, status, status_message, updated_at, updated_at
                FROM environments;
            `);
            // Use created at to define the standby history item
            await queryInterface.sequelize.query(`
                INSERT INTO environments_history_items(environment_id, status, created_at, updated_at)
                SELECT id, "STANDBY", created_at, created_at
                FROM environments e
                WHERE created_at <> updated_at
            `);

            await Promise.all([
                queryInterface.removeColumn('environments', 'status'),
                queryInterface.removeColumn('environments', 'status_message'),
            ]);
        });
    },

    // eslint-disable-next-line require-jsdoc
    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async () => {
            await Promise.all([
                queryInterface.addColumn('environments', 'status', {
                    allowNull: false,
                    type: Sequelize.STRING,
                }),
                queryInterface.addColumn('environments', 'status_message', {
                    type: Sequelize.TEXT,
                }),
            ]);

            await queryInterface.sequelize.query(`
                UPDATE environments e
                    INNER JOIN environments_history_items h
                ON h.environment_id = e.id
                    SET e.status = h.status, e.status_message = h.status_message, e.updated_at = h.updated_at
                ORDER BY h.updated_at DESC
            `);

            await queryInterface.dropTable('environments_history_items');
        });
    },
};
