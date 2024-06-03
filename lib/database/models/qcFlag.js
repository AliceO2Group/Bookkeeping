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
    const QcFlag = sequelize.define(
        'QcFlag',
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            from: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            to: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            comment: {
                type: Sequelize.TEXT,
            },
            origin: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        { tableName: 'quality_control_flags' },
    );

    QcFlag.associate = (models) => {
        QcFlag.belongsTo(models.QcFlagType, { as: 'flagType' });

        QcFlag.belongsToMany(models.DataPass, {
            as: 'dataPasses',
            through: 'data_pass_quality_control_flag',
            foreignKey: 'quality_control_flag_id',
        });
        QcFlag.belongsToMany(models.SimulationPass, {
            as: 'simulationPasses',
            through: 'simulation_pass_quality_control_flag',
            foreignKey: 'quality_control_flag_id',
        });
        QcFlag.belongsTo(models.Run, { foreignKey: 'runNumber', targetKey: 'runNumber', as: 'run' });
        QcFlag.belongsTo(models.DplDetector, { as: 'dplDetector' });
        QcFlag.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
        QcFlag.hasMany(models.QcFlagVerification, { as: 'verifications', foreignKey: 'flagId' });
        QcFlag.hasMany(models.QcFlagEffectivePeriod, { as: 'effectivePeriods', foreignKey: 'flagId' });
    };

    return QcFlag;
};
