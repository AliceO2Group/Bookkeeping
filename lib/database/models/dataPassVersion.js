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

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const DataPassVersion = sequelize.define(
        'DataPassVersion',
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
                unique: true,
            },
            outputSize: {
                type: Sequelize.BIGINT,
            },
            reconstructedEventsCount: {
                type: Sequelize.INTEGER,
            },
            lastSeen: {
                type: Sequelize.INTEGER,
                comment: 'Change of this property in MonALISA means recent job activity that changed data pass version properties',
            },
        },
        { tableName: 'data_pass_versions' },
    );

    DataPassVersion.associate = (models) => {
        DataPassVersion.belongsTo(models.DataPass, { as: 'dataPass' });
    };

    return DataPassVersion;
};
