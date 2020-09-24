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
            await queryInterface.addColumn('flp_roles', 'bytesEquipmentReadOut', {
                type: Sequelize.INTEGER,
            });

            await queryInterface.addColumn('flp_roles', 'bytesRecordingReadOut', {
                type: Sequelize.INTEGER,
            });

            await queryInterface.addColumn('flp_roles', 'bytesFairMQReadOut', {
                type: Sequelize.INTEGER,
            });

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn('flp_roles', 'bytesEquipmentReadOut');

            await queryInterface.removeColumn('flp_roles', 'bytesRecordingReadOut');

            await queryInterface.removeColumn('flp_roles', 'bytesFairMQReadOut');

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },
};
