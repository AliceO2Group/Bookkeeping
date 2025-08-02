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

const { Op } = require('sequelize');
const { DetectorType } = require('../../../domain/enums/DetectorTypes.js');

const NEW_QC_DETECTORS = [
    'VTX',
    'MTE',
    'AOT-GLO',
    'EVS',
    'CEN',
    'EVP',
    'AOT-Event',
    'MUD',
    'GMU',
    'MUON-GLO',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.bulkInsert('detectors', NEW_QC_DETECTORS.map((name) => ({ name, type: DetectorType.QC_ONLY })));
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.bulkDelete('detectors', { name: { [Op.in]: NEW_QC_DETECTORS } });
    }),
};
