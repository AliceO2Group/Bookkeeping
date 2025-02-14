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

    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.changeColumn('runs', 'detectors', {
                    type: Sequelize.STRING,
                }, { transaction }),
            ])),

    down: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.changeColumn('runs', 'detectors', {
                    // eslint-disable-next-line max-len
                    type: Sequelize.ENUM('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC'),
                }, { transaction }),
            ])),
};
