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

const { Sequelize } = require('sequelize');
const { DETECTOR_TYPES, DetectorType } = require('../../../domain/enums/DetectorTypes.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.changeColumn(
            'detectors',
            'type',
            { type: Sequelize.ENUM(...DETECTOR_TYPES), allowNull: false },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.changeColumn(
            'detectors',
            'type',
            {
                type: Sequelize.ENUM([
                    DetectorType.PHYSICAL,
                    DetectorType.QC_ONLY,
                    DetectorType.VIRTUAL,
                    DetectorType.OTHER,
                ]),
                allowNull: false,
            },
        );
    }),
};
