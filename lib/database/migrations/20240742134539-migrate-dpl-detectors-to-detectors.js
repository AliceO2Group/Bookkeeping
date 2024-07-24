/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        const { DetectorType } = await import('../../public/domain/enums/DetectorTypes.mjs');
        await queryInterface.sequelize.query(`
        UPDATE detectors as d
            INNER JOIN dpl_detectors as dpld
                ON d.name = dpld.name
            SET d.id = dpld.id
        `, { transaction });

        await queryInterface.sequelize.query(`
        INSERT INTO detectors(id, name, type)
            SELECT id, name, '${DetectorType.Check}'
            FROM dpl_detectors
            WHERE name NOT IN (SELECT name from detectors)
        `, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        const { DetectorType } = await import('../../public/domain/enums/DetectorTypes.mjs');

        await queryInterface.sequelize.query(`
        DELETE FROM detectors
            WHERE type = ${DetectorType.Check}
        `, { transaction });
    }),
};
