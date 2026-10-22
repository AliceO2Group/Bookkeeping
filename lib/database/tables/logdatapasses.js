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

    const LogDataPasses = sequelize.define('log_data_passes', {
        logId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        dataPassId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
    });

    LogDataPasses.removeAttribute('id');

    LogDataPasses.associate = (models) => {
        LogDataPasses.belongsTo(models.DataPass, { foreignKey: 'data_pass_id', as: 'dataPass' });
        LogDataPasses.belongsTo(models.Log, { foreignKey: 'log_id', as: 'log' });
    };

    return LogDataPasses;
};
