'use strict';

const PARTICLES_PROPERTIES = { // 2 * sqrt(ATOMIC_MASS / ATOMIC_NUMBER)
    ['2#Z/A_pp']: 2 * Math.sqrt(1 / 1),
    ['2#Z/A_PbPb']: 2 * Math.sqrt(207.2 / 82),
    ['2#Z/A_OO']: 2 * Math.sqrt(15.9999, 8),
    ['2#Z/A_XeXe']: 2 * Math.sqrt(131.29, 54),
    ['2#Z/A_cosmic']: 1,
};

const CREATE_PERIODS_VIEW = `
CREATE OR REPLACE VIEW lhc_periods_statistics AS
SELECT
    p.id,
    AVG(r.lhc_beam_energy * center_of_mass_energy_factors.value) AS avg_center_of_mass_energy
FROM lhc_periods AS p
LEFT JOIN  runs AS r
    ON r.lhc_period_id = p.id
    AND r.definition = 'PHYSICS'
    AND r.run_quality = 'good'
LEFT JOIN physical_constants AS center_of_mass_energy_factors
    ON center_of_mass_energy_factors.key = concat('2#Z/A_', r.pdp_beam_type)

GROUP BY p.id
;
`;

const DROP_PERIODS_VIEW = 'DROP VIEW lhc_periods_statistics';

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

        await queryInterface.bulkInsert(
            'physical_constants',
            Object.entries(PARTICLES_PROPERTIES)
                .map(([key, value]) => ({ key, value })),
        );

        await queryInterface.sequelize.query(CREATE_PERIODS_VIEW, { transaction });
        await queryInterface.addIndex('runs', { fields: ['lhc_period_id'] });
    }),

    down: async (queryInterface, _) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DROP_PERIODS_VIEW, { transaction });
        await queryInterface.dropTable('physical_constants', { transaction });
        await queryInterface.removeIndex('runs', ['lhc_period_id']);
    }),
};
