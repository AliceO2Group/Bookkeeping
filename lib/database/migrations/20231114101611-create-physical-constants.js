'use strict';

const basicParticlesProperties = {
    p_Z: 1,
    p_A: 1,
    Pb_Z: 83,
    Pb_A: 207,
    O_Z: 16,
    O_A: 8,
    Xe_Z: 131,
    Xe_A: 54,
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('physical_constants', {
            key: {
                primaryKey: true,
                type: Sequelize.STRING,
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, { transaction });

        await queryInterface.sequelize.query(`
        INSERT INTO physical_constants(\`key\`, \`value\`)
        VALUES ${Object.entries(basicParticlesProperties)
        .map(([key, value]) => `('${key}', '${value}')`)
        .join(', ')};
        `);
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('physical_constants', { transaction });
    }),
};
