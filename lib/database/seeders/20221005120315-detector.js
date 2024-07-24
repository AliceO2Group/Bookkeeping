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

module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction(async (transaction) => {
            const { DetectorType } = await import('../../public/domain/enums/DetectorTypes.mjs');
            await queryInterface.bulkInsert('detectors', [
                {
                    id: 1,
                    name: 'CPV',
                    type: DetectorType.Physical,
                },
                {
                    id: 2,
                    name: 'EMC',
                    type: DetectorType.Physical,
                },
                {
                    id: 3,
                    name: 'FDD',
                    type: DetectorType.Physical,
                },
                {
                    id: 4,
                    name: 'ITS',
                    type: DetectorType.Physical,
                },
                {
                    id: 5,
                    name: 'FV0',
                    type: DetectorType.Physical,
                },
                {
                    id: 6,
                    name: 'HMP',
                    type: DetectorType.Physical,
                },
                {
                    id: 7,
                    name: 'FT0',
                    type: DetectorType.Physical,
                },
                {
                    id: 8,
                    name: 'MCH',
                    type: DetectorType.Physical,
                },
                {
                    id: 9,
                    name: 'MFT',
                    type: DetectorType.Physical,
                },
                {
                    id: 10,
                    name: 'MID',
                    type: DetectorType.Physical,
                },
                {
                    id: 11,
                    name: 'PHS',
                    type: DetectorType.Physical,
                },
                {
                    id: 12,
                    name: 'TOF',
                    type: DetectorType.Physical,
                },
                {
                    id: 13,
                    name: 'TPC',
                    type: DetectorType.Physical,
                },
                {
                    id: 14,
                    name: 'TRD',
                    type: DetectorType.Physical,
                },
                {
                    id: 15,
                    name: 'TST',
                    type: DetectorType.AbstractForRuns,
                },
                {
                    id: 16,
                    name: 'ZDC',
                    type: DetectorType.Physical,
                },
                {
                    id: 17,
                    name: 'ACO',
                    type: DetectorType.Physical,
                },
                {
                    id: 18,
                    name: 'CTP',
                    type: DetectorType.Physical,
                },
                {
                    id: 19,
                    name: 'FIT',
                    type: DetectorType.Physical,
                },
            ], { transaction });
        }),
    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkDelete(
                    'detectors',
                    null,
                    { transaction },
                ),
            ])),
};
