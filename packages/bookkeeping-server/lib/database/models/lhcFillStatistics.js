/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const LhcFillStatistics = sequelize.define('LhcFillStatistics', {
        fillNumber: {
            allowNull: false,
            type: Sequelize.NUMBER,
            primaryKey: true,
        },
        runsCoverage: {
            allowNull: false,
            type: Sequelize.NUMBER,
        },
        efficiency: {
            allowNull: false,
            type: Sequelize.FLOAT,
        },
        timeLossAtStart: {
            allowNull: false,
            type: Sequelize.NUMBER,
        },
        efficiencyLossAtStart: {
            allowNull: false,
            type: Sequelize.FLOAT,
        },
        timeLossAtEnd: {
            allowNull: false,
            type: Sequelize.NUMBER,
        },
        efficiencyLossAtEnd: {
            allowNull: false,
            type: Sequelize.FLOAT,
        },
        meanRunDuration: {
            allowNull: false,
            type: Sequelize.FLOAT,
        },
        totalCtfFileSize: {
            allowNull: false,
            type: Sequelize.BIGINT,
        },
        totalTfFileSize: {
            allowNull: false,
            type: Sequelize.BIGINT,
        },
    }, { tableName: 'fill_statistics', createdAt: false, updatedAt: false });

    LhcFillStatistics.associate = (models) => {
        LhcFillStatistics.belongsTo(models.LhcFill, { foreignKey: 'fillNumber', as: 'lhcFill' });
    };

    return LhcFillStatistics;
};
