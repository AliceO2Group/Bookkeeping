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
    const QcFlagEffectivePeriod = sequelize.define(
        'QcFlagEffectivePeriod',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            from: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            to: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        },
        { tableName: 'quality_control_flag_discarded_periods' },
    );

    QcFlagEffectivePeriod.associate = (models) => {
        QcFlagEffectivePeriod.belongsTo(models.QcFlag, { as: 'flag', sourceKey: 'flagId' });
    };

    return QcFlagEffectivePeriod;
};
