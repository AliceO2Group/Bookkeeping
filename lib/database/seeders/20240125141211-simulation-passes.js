/**
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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkInsert('simulation_passes', [

                ], { transaction }),

                queryInterface.bulkInsert('anchored_passes', [

                ], { transaction }),

                queryInterface.bulkInsert('simulation_passes_runs', [

                ], { transaction }),
            ])),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.bulkDelete('simulation_passes_runs', null, { transaction }),
                queryInterface.bulkDelete('anchored_passes', null, { transaction }),
                queryInterface.bulkDelete('simulation_passes', null, { transaction }),

            ])),
};
