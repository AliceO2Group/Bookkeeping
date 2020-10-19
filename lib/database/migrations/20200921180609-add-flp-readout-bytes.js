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
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('flp_roles', 'bytes_equipment_read_out', {
                type: Sequelize.INTEGER,
            });

            await queryInterface.addColumn('flp_roles', 'bytes_recording_read_out', {
                type: Sequelize.INTEGER,
            });

            await queryInterface.addColumn('flp_roles', 'bytes_fair_m_q_read_out', {
                type: Sequelize.INTEGER,
            });

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },

    down: async (queryInterface) => {
        try {
            await queryInterface.removeColumn('flp_roles', 'bytes_equipment_read_out');

            await queryInterface.removeColumn('flp_roles', 'bytes_recording_read_out');

            await queryInterface.removeColumn('flp_roles', 'bytes_fair_m_q_read_out');

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },
};
