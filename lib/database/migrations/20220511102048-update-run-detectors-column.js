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
/* eslint-disable valid-jsdoc */

module.exports = {

    /**
     * Update runs.detectors column to a string and move validation on server side
     * This will allow for multiple detectors to be set as a string separated by comma
     */
    up: ({ context: { Sequelize, queryInterface } }) => queryInterface.changeColumn('runs', 'detectors', {
        type: Sequelize.STRING,
    }),

    /**
     * Revert above changes
     */
    down: ({ context: { queryInterface, Sequelize } }) => queryInterface.changeColumn('runs', 'detectors', {
        type: Sequelize.ENUM('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC'),
    }),
};
