'use strict';

const CREATE_PERIODS_VIEW = `
CREATE OR REPLACE VIEW lhc_periods_statistics AS
SELECT  
    p.id,
    GROUP_CONCAT(DISTINCT(r.pdp_beam_type)) as beam_type
    AVG(r.lhc_beam_energy) AS avgEnergy
FROM lhc_periods AS p
LEFT JOIN  runs as r
    ON r.lhc_period_id = p.id
    AND r.definition = 'PHYSICS'
GROUP BY p.id
;
`;

const DROP_PERIODS_VIEW = 'DROP VIEW lhc_periods_statistics';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, _) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(CREATE_PERIODS_VIEW, { transaction });
    }),

    down: async (queryInterface, _) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DROP_PERIODS_VIEW, { transaction });
    }),
};
