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
                    },
                    {
                        id: 2,
                        name: 'EMC',
                    },
                    {
                        id: 3,
                        name: 'FDD',
                    },
                    {
                        id: 4,
                        name: 'ITS',
                    },
                    {
                        id: 5,
                        name: 'FV0',
                    },
                    {
                        id: 6,
                        name: 'HMP',
                    },
                    {
                        id: 7,
                        name: 'FT0',
                    },
                    {
                        id: 8,
                        name: 'MCH',
                    },
                    {
                        id: 9,
                        name: 'MFT',
                    },
                    {
                        id: 10,
                        name: 'MID',
                    },
                    {
                        id: 11,
                        name: 'PHS',
                    },
                    {
                        id: 12,
                        name: 'TOF',
                    },
                    {
                        id: 13,
                        name: 'TPC',
                    },
                    {
                        id: 14,
                        name: 'TRD',
                    },
                    {
                        id: 15,
                        name: 'TST',
                    },
                    {
                        id: 16,
                        name: 'ZDC',
                    },
                    {
                        id: 17,
                        name: 'ACO',
                    },
                    {
                        id: 18,
                        name: 'CTP',
                    },
                    {
                        id: 19,
                        name: 'FIT',
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
