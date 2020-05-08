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

module.exports = (sequelize, Sequelize) => {
    const Run = sequelize.define('Run', {
        timeO2Start: Sequelize.DATE,
        timeO2End: Sequelize.DATE,
        timeTrgStart: Sequelize.DATE,
        timeTrgEnd: Sequelize.DATE,
        activityId: Sequelize.CHAR,
        runType: Sequelize.ENUM('physics', 'cosmics', 'technical'),
        runQuality: Sequelize.ENUM('good', 'bad', 'unknown'),
        nDetectors: Sequelize.INTEGER,
        nFlps: Sequelize.INTEGER,
        nEpns: Sequelize.INTEGER,
        nSubtimeframes: Sequelize.INTEGER,
        bytesReadOut: Sequelize.INTEGER,
        bytesTimeframe_builder: Sequelize.INTEGER,
    }, {});

    Run.associate = (models) => {
        Run.belongsToMany(models.Log, { through: 'log_runs' });
    };

    return Run;
};
