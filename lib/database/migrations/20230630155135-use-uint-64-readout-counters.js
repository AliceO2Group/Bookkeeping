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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.changeColumn('flp_roles', 'n_timeframes', {
                    type: Sequelize.BIGINT.UNSIGNED,
                }, { transaction }),

                queryInterface.changeColumn('flp_roles', 'bytes_recording_read_out', {
                    type: Sequelize.BIGINT.UNSIGNED,
                }, { transaction }),

                queryInterface.changeColumn('flp_roles', 'bytes_fair_m_q_read_out', {
                    type: Sequelize.BIGINT.UNSIGNED,
                }, { transaction }),
                queryInterface.changeColumn('flp_roles', 'bytes_equipment_read_out', {
                    type: Sequelize.BIGINT.UNSIGNED,
                }, { transaction }),
            ])),

    down: async (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.changeColumn('flp_roles', 'n_timeframes', {
                    type: Sequelize.INTEGER,
                }, { transaction }),

                queryInterface.changeColumn('flp_roles', 'bytes_recording_read_out', {
                    type: Sequelize.INTEGER,
                }, { transaction }),

                queryInterface.changeColumn('flp_roles', 'bytes_fair_m_q_read_out', {
                    type: Sequelize.INTEGER,
                }, { transaction }),
                queryInterface.changeColumn('flp_roles', 'bytes_equipment_read_out', {
                    type: Sequelize.INTEGER,
                }, { transaction }),
            ])),
};
