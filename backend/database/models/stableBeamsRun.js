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
    const StableBeamsRun = sequelize.define('StableBeamsRun', {
        runNumber: {
            allowNull: false,
            type: Sequelize.NUMBER,
            primaryKey: true,
        },
        fillNumber: {
            allowNull: false,
            type: Sequelize.NUMBER,
            primaryKey: true,
        },
        sbDuration: {
            allowNull: false,
            type: Sequelize.NUMBER,
        },
        sbStart: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        sbEnd: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        sbRunStart: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        sbRunEnd: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        sbRunDuration: {
            allowNull: false,
            type: Sequelize.NUMBER,
        },
    }, { tableName: 'stable_beam_runs', createdAt: false, updatedAt: false });

    StableBeamsRun.associate = (models) => {
        StableBeamsRun.belongsTo(models.Run, { targetKey: 'runNumber', foreignKey: 'runNumber', as: 'run' });
    };

    return StableBeamsRun;
};
