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
    up: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('run_detectors', [
                    {
                        run_id: 106,
                        detector_id: 1,
                        quality: 'good',
                    },
                    {
                        run_id: 106,
                        detector_id: 2,
                        quality: 'bad',
                    },
                    {
                        run_id: 106,
                        detector_id: 3,
                        quality: 'none',
                    },
                    {
                        run_id: 106,
                        detector_id: 4,
                        quality: 'good',
                    },
                    {
                        run_id: 106,
                        detector_id: 5,
                        quality: 'good',
                    },
                    {
                        run_id: 106,
                        detector_id: 6,
                        quality: 'good',
                    },
                    {
                        run_id: 106,
                        detector_id: 8,
                        quality: 'good',
                    },
                    {
                        run_id: 2,
                        detector_id: 15,
                        quality: 'good',
                    },
                ], { transaction }),
            ])),

    down: async ({ context: { queryInterface } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('run_detectors', null, { transaction })])),
};
