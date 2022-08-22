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
    up: async ({ context: { queryInterface, Sequelize } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.changeColumn('logs', 'user_id', {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                }, { transaction }),
            ])),

    down: async ({ context: { queryInterface, Sequelize } }) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([
                queryInterface.changeColumn('logs', 'user_id', {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                }, { transaction }),
            ])),
};
