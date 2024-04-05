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
    const DataPass = sequelize.define(
        'DataPass',
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            outputSize: {
                type: Sequelize.BIGINT,
            },
            reconstructedEventsCount: {
                type: Sequelize.INTEGER,
            },
            lastRunNumber: {
                type: Sequelize.INTEGER,
            },
        },
        { tableName: 'data_passes' },
    );

    DataPass.associate = (models) => {
        DataPass.belongsTo(models.LhcPeriod, { as: 'lhcPeriod' });
        DataPass.belongsToMany(models.Run, { as: 'runs', foreignKey: 'data_pass_id', through: 'data_passes_runs' });
        DataPass.belongsToMany(models.SimulationPass, {
            as: 'anchoredSimulationPasses',
            foreignKey: 'data_pass_id',
            through: 'simulation_pass_data_pass_anchors',
        });

        DataPass.belongsToMany(models.QcFlag, {
            as: 'qcFlags',
            foreignKey: 'data_pass_id',
            through: 'data_pass_quality_control_flag',
        });
    };

    return DataPass;
};
