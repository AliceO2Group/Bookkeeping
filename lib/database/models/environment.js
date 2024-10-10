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
    const Environment = sequelize.define('Environment', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.CHAR,
        },
        rawConfiguration: {
            type: Sequelize.TEXT,
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
        },
    });

    Environment.associate = (models) => {
        Environment.hasMany(models.Run, {
            as: 'runs',
            foreignKey: {
                name: 'envId',
            },
        });
        Environment.hasMany(models.EnvironmentHistoryItem, {
            as: 'historyItems',
            foreignKey: {
                name: 'environmentId',
            },
        });
        Environment.belongsToMany(models.Log, {
            as: 'logs',
            through: 'log_environments',
        });
    };

    return Environment;
};
