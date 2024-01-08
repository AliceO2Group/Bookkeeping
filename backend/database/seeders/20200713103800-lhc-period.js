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

module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            queryInterface.bulkInsert('lhc_periods', [
                {
                    id: 1,
                    name: 'LHC22a',
                },
                {
                    id: 2,
                    name: 'LHC22b',
                },
                {
                    id: 3,
                    name: 'LHC23f',
                },
            ], { transaction })),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            queryInterface.bulkDelete('lhc_periods', null, { transaction })),
};
