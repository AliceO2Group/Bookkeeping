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

module.exports = (sequelize) => {
    const Sequelize = require('sequelize');

    const FlpRoles = sequelize.define('FlpRoles', {
        name: {
            type: Sequelize.STRING,
        },
        hostname: {
            type: Sequelize.STRING,
        },
        nTimeframes: {
            type: Sequelize.INTEGER,
        },
        bytesProcessed: {
            type: Sequelize.INTEGER,
        },
        bytesEquipmentReadOut: {
            type: Sequelize.INTEGER,
        },
        bytesRecordingReadOut: {
            type: Sequelize.INTEGER,
        },
        bytesFairMQReadOut: {
            type: Sequelize.INTEGER,
        },
    });

    FlpRoles.associate = (models) => {
        FlpRoles.belongsToMany(models.Run, { as: 'runs', through: 'flp_runs' });
    };

    return FlpRoles;
};
