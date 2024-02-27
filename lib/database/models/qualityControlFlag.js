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
    const QualityControlFlag = sequelize.define(
        'QualityControlFlag',
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
        },
        { tableName: 'quality_control_flags' },
    );

    QualityControlFlag.associate = (models) => {
        QualityControlFlag.belongsTo(models.QualityControlFlagType, { as: 'flagType' });

        QualityControlFlag.belongsToMany(models.DataPass, { as: 'dataPasses', through: 'data_pass_quality_control_flag' });
        QualityControlFlag.belongsToMany(models.SimulationPass, { as: 'simulationPasses', through: 'simulation_pass_quality_control_flag' });
        QualityControlFlag.belongsTo(models.Run, { foreignKey: 'runNumber', targetKey: 'runNumber', as: 'run' });
        QualityControlFlag.belongsTo(models.DplDetector, { as: 'dplDetector' });
        QualityControlFlag.belongsTo(models.User, { as: 'user', foreignKey: 'created_by_id' });
    };

    return QualityControlFlag;
};
