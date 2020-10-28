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
  up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('flp_runs', [
    {
      flp_role_id: 1,
      run_id: 1,
    },
    {
      flp_role_id: 2,
      run_id: 1,
    },
    {
      flp_role_id: 2,
      run_id: 2,
    },
    {
      flp_role_id: 3,
      run_id: 1,
    },
    {
      flp_role_id: 3,
      run_id: 3,
    },
    {
      flp_role_id: 4,
      run_id: 1,
    },
    {
      flp_role_id: 4,
      run_id: 2,
    },
    {
      flp_role_id: 4,
      run_id: 6,
    },
  ]),

  down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('flp_runs', null, {}),
};
