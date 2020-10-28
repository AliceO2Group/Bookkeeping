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
  up: (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.addConstraint('flp_runs', {
      fields: ['flp_role_id'],
      type: 'foreign key',
      name: 'fk_flp_id_flp_runs',
      references: {
        table: 'flp_roles',
        field: 'id',
      },
    }, { transaction: t }),
    queryInterface.addConstraint('flp_runs', {
      fields: ['run_id'],
      type: 'foreign key',
      name: 'fk_run_id_flp_runs',
      references: {
        table: 'runs',
        field: 'id',
      },
    }, { transaction: t }),
  ])),

  down: (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.removeConstraint('flp_runs', 'fk_flp_id_flp_runs', { transaction: t }),
    queryInterface.removeConstraint('flp_runs', 'fk_run_id_flp_runs', { transaction: t }),
  ])),
};
