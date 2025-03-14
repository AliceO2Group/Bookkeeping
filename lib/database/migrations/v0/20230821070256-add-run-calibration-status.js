/*
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

'use strict';

const { RUN_CALIBRATION_STATUS, RunCalibrationStatus } = require('../../../domain/enums/RunCalibrationStatus.js');
const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');

const UPDATE_CALIBRATION_STATUS = `UPDATE runs
                                   SET calibration_status = '${RunCalibrationStatus.NO_STATUS}'
                                   WHERE definition = '${RunDefinition.CALIBRATION}'`;

const ADD_CALIBRATION_STATUS_CONSTRAINT = `ALTER TABLE runs
    ADD CONSTRAINT require_calibration_definition_calibration_status CHECK ( calibration_status IS NULL XOR definition = 'CALIBRATION' ) `;

const DELETE_CALIBRATION_STATUS_CONSTRAINT = `ALTER TABLE runs
   DROP CONSTRAINT require_calibration_definition_calibration_status`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('runs', 'calibration_status', {
            type: Sequelize.ENUM(...RUN_CALIBRATION_STATUS),
        }, { transaction });
        await queryInterface.sequelize.query(UPDATE_CALIBRATION_STATUS, { transaction });
        await queryInterface.sequelize.query(ADD_CALIBRATION_STATUS_CONSTRAINT, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(DELETE_CALIBRATION_STATUS_CONSTRAINT, { transaction });
        await queryInterface.removeColumn('runs', 'calibration_status', { transaction });
    }),
};
