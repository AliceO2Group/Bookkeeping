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

    const Run = sequelize.define('Run', {
        runNumber: {
            type: Sequelize.INTEGER,
        },
        timeO2Start: {
            type: Sequelize.DATE,
        },
        timeO2End: {
            type: Sequelize.DATE,
        },
        timeTrgStart: {
            type: Sequelize.DATE,
        },
        timeTrgEnd: {
            type: Sequelize.DATE,
        },
        environmentId: {
            type: Sequelize.STRING,
        },
        runType: {
            type: Sequelize.ENUM('physics', 'cosmics', 'technical'),
        },
        runQuality: {
            type: Sequelize.ENUM('good', 'bad', 'unknown', 'test'),
        },
        nDetectors: {
            type: Sequelize.INTEGER,
        },
        nFlps: {
            type: Sequelize.INTEGER,
        },
        nEpns: {
            type: Sequelize.INTEGER,
        },
        nSubtimeframes: {
            type: Sequelize.INTEGER,
        },
        bytesReadOut: {
            type: Sequelize.INTEGER,
        },
        dd_flp: {
            type: Sequelize.BOOLEAN,
        },
        dcs: {
            type: Sequelize.BOOLEAN,
        },
        epn: {
            type: Sequelize.BOOLEAN,
        },
        epnTopology: {
            type: Sequelize.STRING,
        },
        detectors: {
            type: Sequelize.ENUM('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC'),
        },
        lhcBeamEnergy: {
            type: Sequelize.FLOAT,
        },
        lhcBeamMode: {
            type: Sequelize.CHAR(32),
        },
        lhcBetaStar: {
            type: Sequelize.FLOAT,
        },
        aliceL3Current: {
            type: Sequelize.FLOAT,
        },
        aliceDipoleCurrent: {
            type: Sequelize.FLOAT,
        },
    });

    Run.associate = (models) => {
        Run.belongsTo(models.Environment, { foreignKey: 'envId' });
        Run.belongsToMany(models.Log, { through: 'log_runs' });
        Run.belongsToMany(models.FlpRoles, { through: 'flp_runs' });
        Run.belongsToMany(models.Tag, { through: 'run_tags', as: 'tags' });
        Run.hasOne(models.LhcFill, { foreignKey: 'fillNumber' });
        Run.hasMany(models.EorReason, { as: 'eorReasons' });
    };

    return Run;
};
