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
/* eslint-disable require-jsdoc */
const { QueryTypes } = require('sequelize');

// Raw SQL query to populate detectors relation table from detectors column
const DETECTORS_COLUMN_TO_RELATION_TABLE = 'INSERT INTO run_detectors (run_number, detector_id) '
    + 'SELECT r.run_number, d.id FROM detectors d INNER JOIN runs r ON r.detectors LIKE CONCAT(\'%\', d.name, \'%\') '
    + 'WHERE detectors IS NOT NULL AND detectors <> \'\'';

// Raw SQL query to populate detectors columns from detectors relation table
const DETECTORS_RELATION_TABLE_TO_COLUMN = 'UPDATE runs\n' +
    '    INNER JOIN (\n' +
    '    SELECT r.run_number run_number, GROUP_CONCAT(d.name SEPARATOR \',\') detectors\n' +
    '                FROM run_detectors rd\n' +
    '                         INNER JOIN runs r ON rd.run_number = r.run_number\n' +
    '                         INNER JOIN detectors d on rd.detector_id = d.id\n' +
    '                GROUP BY r.run_number\n' +
    ') AS detectors_list ON detectors_list.run_number = runs.run_number\n' +
    'SET runs.detectors = detectors_list.detectors';

module.exports = {
    async up(queryInterface) {
        queryInterface.sequelize.transaction(async () => {
            /**
             * Add altering commands here.
             *
             * Example:
             * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
             */
            const detectorsStrings = await queryInterface.sequelize.query('SELECT DISTINCT detectors FROM runs', { type: QueryTypes.SELECT });
            const detectors = [
                ...new Set(detectorsStrings
                    .filter(({ detectors: detectorsString }) => Boolean(detectorsString))
                    .map(({ detectors }) => detectors.split(',').map((detector) => detector.trim()))
                    .flat()),
            ];

            if (detectors.length > 0) {
                await queryInterface.bulkInsert('detectors', detectors.map((detector) => ({ name: detector })));
                await queryInterface.sequelize.query(DETECTORS_COLUMN_TO_RELATION_TABLE);
            }
        });
    },

    async down(queryInterface) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.sequelize.query(DETECTORS_RELATION_TABLE_TO_COLUMN);
    },
};
