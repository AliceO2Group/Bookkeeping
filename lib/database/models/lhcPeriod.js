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
    const LhcPeriod = sequelize.define(
        'LhcPeriod',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        { tableName: 'lhc_periods' },
    );

    LhcPeriod.associate = (models) => {
        LhcPeriod.hasMany(models.Run, { foreignKey: 'lhcPeriodId', as: 'runs' });
        LhcPeriod.hasMany(models.DataPass);
    };

    return LhcPeriod;
};
