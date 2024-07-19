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
                        is_physicals: true,
                    },
                    {
                        id: 2,
                        name: 'EMC',
                        is_physicals: true,
                    },
                    {
                        id: 3,
                        name: 'FDD',
                        is_physicals: true,
                    },
                    {
                        id: 4,
                        name: 'ITS',
                        is_physicals: true,
                    },
                    {
                        id: 5,
                        name: 'FV0',
                        is_physicals: true,
                    },
                    {
                        id: 6,
                        name: 'HMP',
                        is_physicals: true,
                    },
                    {
                        id: 7,
                        name: 'FT0',
                        is_physicals: true,
                    },
                    {
                        id: 8,
                        name: 'MCH',
                        is_physicals: true,
                    },
                    {
                        id: 9,
                        name: 'MFT',
                        is_physicals: true,
                    },
                    {
                        id: 10,
                        name: 'MID',
                        is_physicals: true,
                    },
                    {
                        id: 11,
                        name: 'PHS',
                        is_physicals: true,
                    },
                    {
                        id: 12,
                        name: 'TOF',
                        is_physicals: true,
                    },
                    {
                        id: 13,
                        name: 'TPC',
                        is_physicals: true,
                    },
                    {
                        id: 14,
                        name: 'TRD',
                        is_physicals: true,
                    },
                    {
                        id: 15,
                        name: 'TST',
                    },
                    {
                        id: 16,
                        name: 'ZDC',
                        is_physicals: true,
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
