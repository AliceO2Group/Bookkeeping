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

const { Op, Sequelize } = require('sequelize');
const { DetectorType, DETECTOR_TYPES } = require('../../../domain/enums/DetectorTypes.js');

const NEW_QC_DETECTORS = [
    ['VTX', DetectorType.AOT_GLO],
    ['MTE', DetectorType.AOT_GLO],

    ['EVS', DetectorType.AOT_EVENT],
    ['CEN', DetectorType.AOT_EVENT],
    ['EVP', DetectorType.AOT_EVENT],

    ['MUD', DetectorType.MUON_GLO],
    ['GMU', DetectorType.MUON_GLO],
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.changeColumn(
            'detectors',
            'type',
            { type: Sequelize.ENUM(...DETECTOR_TYPES), allowNull: false },
            { transaction },
        );
        await queryInterface.bulkInsert('detectors', NEW_QC_DETECTORS.map(([name, type]) => ({ name, type })), { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.bulkDelete('detectors', { name: { [Op.in]: NEW_QC_DETECTORS } });
    }),
};
