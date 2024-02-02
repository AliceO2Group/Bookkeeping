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
            time_start: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            time_end: {
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
        QualityControlFlag.belongsTo(models.QualityControlFlagTypes);
        QualityControlFlag.hasMany(models.QualityControlFlagVerification);

        QualityControlFlag.belongsTo(models.DataPass);
        QualityControlFlag.belongsTo(models.Run, { foreingKey: 'runNumber' });
        QualityControlFlag.belongsTo(models.Detector);
        QualityControlFlag.belongsTo(models.User);
    };

    return QualityControlFlag;
};
