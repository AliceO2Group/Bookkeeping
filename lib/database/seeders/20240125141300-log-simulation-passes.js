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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            queryInterface.bulkInsert('log_simulation_passes', [
                { log_id: 1, simulation_pass_id: 1 },
                { log_id: 1, simulation_pass_id: 2 },
                { log_id: 2, simulation_pass_id: 3 },
                { log_id: 119, simulation_pass_id: 1 },
            ], { transaction })),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            queryInterface.bulkDelete('log_simulation_passes', null, { transaction })),
};
