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
        queryInterface.addIndex('logs', {
            name: 'logs_subtype_idx',
            fields: ['subtype'],
        }, { transaction: t }),
        queryInterface.addIndex('logs', {
            name: 'logs_origin_idx',
            fields: ['origin'],
        }, { transaction: t }),
    ])),

    down: (queryInterface, _Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeIndex('logs', 'logs_subtype_idx', { transaction: t }),
        queryInterface.removeIndex('logs', 'logs_origin_idx', { transaction: t }),
    ])),
};
