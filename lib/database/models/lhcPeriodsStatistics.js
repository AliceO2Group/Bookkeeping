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
    const LhcPeriodStatistics = sequelize.define(
        'LhcPeriodStatistics',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            avgCenterOfMassEnergy: {
                type: Sequelize.FLOAT,
                allowNull: true,
                field: 'avg_center_of_mass_energy',
            },
            distinctCenterOfMassEnergies: {
                type: Sequelize.JSON,
                allowNull: true,
                field: 'distinct_center_of_mass_energies',
                // eslint-disable-next-line require-jsdoc
                get() {
                    return this.getDataValue('distinctCenterOfMassEnergies')
                        ?.slice(1, -1)
                        .split(',')
                        .map((energy) => Number(energy));
                },
            },
        },
        { tableName: 'lhc_periods_statistics', timestamps: false },
    );

    LhcPeriodStatistics.associate = (models) => {
        LhcPeriodStatistics.belongsTo(models.LhcPeriod, { foreignKey: 'id', as: 'lhcPeriod' });
    };

    return LhcPeriodStatistics;
};
