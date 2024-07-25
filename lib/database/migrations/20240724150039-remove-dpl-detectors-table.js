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

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        // if (1) {
        //     throw new Error();
        // }

        const [constraints] = await queryInterface.sequelize.query(`
            SELECT CONSTRAINT_NAME, UNIQUE_CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
            FROM information_schema.REFERENTIAL_CONSTRAINTS
            WHERE REFERENCED_TABLE_NAME = 'dpl_detectors'
        `, { transaction });

        for (const { CONSTRAINT_NAME, TABLE_NAME } of constraints) {
            await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME, { transaction });
            await queryInterface.addConstraint(TABLE_NAME, {
                type: 'FOREIGN KEY',
                fields: ['dpl_detector_id'],
                name: `detector_id_fk_${TABLE_NAME.toLowerCase()}`,
                references: {
                    table: 'detectors',
                    field: 'id',
                },
            }, { transaction });
        }
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
    }),
};
