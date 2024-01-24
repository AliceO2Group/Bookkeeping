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
    const SimulationPass = sequelize.define(
        'SimulationPass',
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            description: {
                type: Sequelize.TEXT,
            },
            jira: {
                type: Sequelize.STRING,
            },
            pwg: {
                type: Sequelize.TEXT,
            },
            requestedEventsCount: {
                type: Sequelize.INTEGER,
            },
            generatedEventsCount: {
                type: Sequelize.INTEGER,
            },
            outputSize: {
                type: Sequelize.REAL,
            },
        },
        { tableName: 'simulation_passes' },
    );

    SimulationPass.associate = (models) => {
        SimulationPass.belongsToMany(models.DataPass, {
            as: 'dataPass',
            foreignKey: 'simulation_pass_id',
            through: 'anchored_passes',
        });
        SimulationPass.belongsToMany(models.Run, {
            as: 'runs',
            foreignKey: 'simulation_pass_id',
            through: 'simulation_passes_runs',
        });
    };

    return SimulationPass;
};
