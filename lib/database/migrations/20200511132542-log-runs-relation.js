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
    up: async ({ context: { queryInterface } }) => queryInterface.sequelize.transaction((transaction) =>
        Promise.all([
            queryInterface.addConstraint('log_runs', {
                fields: ['log_id'],
                type: 'foreign key',
                name: 'fk_log_id_log_runs',
                references: {
                    table: 'logs',
                    field: 'id',
                },
            }, { transaction }),
            queryInterface.addConstraint('log_runs', {
                fields: ['run_id'],
                type: 'foreign key',
                name: 'fk_run_id_log_runs',
                references: {
                    table: 'runs',
                    field: 'id',
                },
            }, { transaction }),
        ])),

    down: async ({ context: { queryInterface } }) => queryInterface.sequelize.transaction((transaction) =>
        Promise.all([
            queryInterface.removeConstraint('log_runs', 'fk_log_id_log_runs', { transaction }),
            queryInterface.removeConstraint('log_runs', 'fk_run_id_log_runs', { transaction }),
        ])),
};
