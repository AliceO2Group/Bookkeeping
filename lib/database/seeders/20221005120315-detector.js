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
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('detectors', [
                    {
                        id: 1,
                        name: 'CPV',
                        is_physical: true,
                    },
                    {
                        id: 2,
                        name: 'EMC',
                        is_physical: true,
                    },
                    {
                        id: 3,
                        name: 'FDD',
                        is_physical: true,
                    },
                    {
                        id: 4,
                        name: 'ITS',
                        is_physical: true,
                    },
                    {
                        id: 5,
                        name: 'FV0',
                        is_physical: true,
                    },
                    {
                        id: 6,
                        name: 'HMP',
                        is_physical: true,
                    },
                    {
                        id: 7,
                        name: 'FT0',
                        is_physical: true,
                    },
                    {
                        id: 8,
                        name: 'MCH',
                        is_physical: true,
                    },
                    {
                        id: 9,
                        name: 'MFT',
                        is_physical: true,
                    },
                    {
                        id: 10,
                        name: 'MID',
                        is_physical: true,
                    },
                    {
                        id: 11,
                        name: 'PHS',
                        is_physical: true,
                    },
                    {
                        id: 12,
                        name: 'TOF',
                        is_physical: true,
                    },
                    {
                        id: 13,
                        name: 'TPC',
                        is_physical: true,
                    },
                    {
                        id: 14,
                        name: 'TRD',
                        is_physical: true,
                    },
                    {
                        id: 15,
                        name: 'TST',
                    },
                    {
                        id: 16,
                        name: 'ZDC',
                        is_physical: true,
                    },
                    {
                        id: 17,
                        name: 'ACO',
                        is_physical: true,
                    },
                    {
                        id: 18,
                        name: 'CTP',
                        is_physical: true,
                    },
                    {
                        id: 19,
                        name: 'FIT',
                        is_physical: true,
                    },
                    {
                        id: 20,
                        name: 'QC-SPECIFIC',
                    },
                    {
                        id: 21,
                        name: 'GLO',
                    },
                ], { transaction }),
            ])),
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
