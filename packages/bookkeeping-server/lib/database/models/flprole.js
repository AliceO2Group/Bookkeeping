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

    const FlpRole = sequelize.define('FlpRole', {
        runNumber: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
        },
        hostname: {
            type: Sequelize.STRING,
        },
        nTimeframes: {
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        bytesProcessed: {
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        bytesEquipmentReadOut: {
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        bytesRecordingReadOut: {
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        bytesFairMQReadOut: {
            type: Sequelize.BIGINT,
            unsigned: true,
        },
    });

    FlpRole.associate = (models) => {
        FlpRole.belongsTo(models.Run, { as: 'run', targetKey: 'runNumber', foreignKey: 'runNumber' });
    };

    return FlpRole;
};
