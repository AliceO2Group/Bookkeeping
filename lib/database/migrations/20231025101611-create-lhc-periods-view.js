'use strict';

const CREATE_PERIODS_VIEW = `
CREATE OR REPLACE VIEW lhc_periods_statistics AS
SELECT  
    p.id,
    AVG(r.lhc_beam_energy) AS avgEnergy
FROM lhc_periods AS p
LEFT JOIN (
    SELECT * FROM runs
        WHERE
            definition = 'PHYSICS'
    ) AS r
    ON r.lhc_period_id = p.id
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
