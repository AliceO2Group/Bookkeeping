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

module.exports = (sequelize) => {
    const Sequelize = require('sequelize');

    const LogSimulationPasses = sequelize.define('log_simulation_passes', {
        logId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        simulationPassId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
    });

    LogSimulationPasses.removeAttribute('id');

    LogSimulationPasses.associate = (models) => {
        LogSimulationPasses.belongsTo(models.SimulationPass, { foreignKey: 'simulation_pass_id', as: 'simulationPass' });
        LogSimulationPasses.belongsTo(models.Log, { foreignKey: 'log_id', as: 'log' });
    };

    return LogSimulationPasses;
};
