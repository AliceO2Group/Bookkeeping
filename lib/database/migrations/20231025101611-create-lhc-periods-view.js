'use strict';

const CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX = '2#Z/A';

const basicParticlesProperties = { // 2 * sqrt(ATOMIC_MASS / ATOMIC_NUMBER)
    [`${CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX}_pp`]: 2 * Math.sqrt(1 / 1),
    [`${CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX}_PbPb`]: 2 * Math.sqrt(207.2 / 82),
    [`${CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX}_OO`]: 2 * Math.sqrt(15.9999, 8),
    [`${CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX}_XeXe`]: 2 * Math.sqrt(131.29, 54),
    [`${CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX}_cosmic`]: 1,
};

const CREATE_PERIODS_VIEW = `
CREATE OR REPLACE VIEW lhc_periods_statistics AS
SELECT  
    p.id,
    AVG(r.lhc_beam_energy * center_of_mass_energy_factors.value) AS avg_center_of_mass_energy,
    GROUP_CONCAT(DISTINCT(r.lhc_beam_energy * center_of_mass_energy_factors.value)) AS distinct_center_of_mass_energies
FROM lhc_periods AS p
LEFT JOIN  runs AS r
    ON r.lhc_period_id = p.id
    AND r.definition = 'PHYSICS'
LEFT JOIN physical_constants AS center_of_mass_energy_factors
    ON center_of_mass_energy_factors.key = concat('${CENTER_OF_MASS_ENERGY_FACTOR_KEY_PREFIX}_', r.pdp_beam_type)

GROUP BY p.id
;
`;

const DROP_PERIODS_VIEW = 'DROP VIEW lhc_periods_statistics';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('physical_constants', { transaction });
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

        await queryInterface.sequelize.query(CREATE_PERIODS_VIEW, { transaction });
    }),

    down: async (queryInterface, _) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DROP_PERIODS_VIEW, { transaction });
        await queryInterface.dropTable('physical_constants', { transaction });
    }),
};
