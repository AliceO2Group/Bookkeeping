'use strict';

const CREATE_PERIODS_VIEW = `
CREATE OR REPLACE VIEW lhc_periods_with_statistics AS
SELECT  
    p.id,
    p.name,
    AVG(r.lhc_beam_energy) AS avgEnergy,
    p.created_at,
    p.updated_at
FROM lhc_periods AS p
INNER JOIN runs AS r
    ON r.lhc_period_id = p.id
WHERE
    r.definition = 'PHYSICS'
GROUP BY p.id
;
`;

const DROP_PERIODS_VIEW = 'DROP VIEW lhc_periods_with_statistics';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, _) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(CREATE_PERIODS_VIEW, { transaction });
    }),

    down: async (queryInterface, _) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DROP_PERIODS_VIEW, { transaction });
    }),
};
