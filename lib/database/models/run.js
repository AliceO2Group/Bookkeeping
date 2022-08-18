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
        runDuration: {
            type: Sequelize.VIRTUAL,
            // eslint-disable-next-line require-jsdoc
            get() {
                const timeTriggerStart = this.getDataValue('timeTrgStart');
                const timeTriggerEnd = this.getDataValue('timeTrgEnd') || new Date().getTime();

                if (timeTriggerStart === null) {
                    return null;
                }

                return timeTriggerEnd - timeTriggerStart;
            },
        },
        environmentId: {
            type: Sequelize.STRING,
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
        aliceL3Polarity: {
            type: Sequelize.CHAR(32),
        },
        aliceDipolePolarity: {
            type: Sequelize.CHAR(32),
        },
        trgGlobalRunEnabled: {
            type: Sequelize.BOOLEAN,
        },
        trgEnabled: {
            type: Sequelize.BOOLEAN,
        },
        triggerValue: {
            type: Sequelize.DataTypes.ENUM('OFF', 'LTU', 'CTP'),
        },
        odcTopologyFullName: {
            type: Sequelize.STRING,
            default: null,
        },
        pdpConfigOption: {
            type: Sequelize.STRING,
            default: null,
        },
        pdpTopologyDescriptionLibraryFile: {
            type: Sequelize.STRING,
            default: null,
        },
        tfbDdMode: {
            type: Sequelize.CHAR(64),
            default: null,
        },
        lhcPeriod: {
            type: Sequelize.CHAR(64),
        },
    });

    Run.associate = (models) => {
        Run.belongsTo(models.Environment, { foreignKey: 'envId' });
        Run.belongsTo(models.RunType, { as: 'runType' });
        Run.belongsToMany(models.Log, { through: 'log_runs' });
        Run.belongsToMany(models.FlpRoles, { through: 'flp_runs' });
        Run.belongsToMany(models.Tag, { through: 'run_tags', as: 'tags' });
        Run.hasOne(models.LhcFill, { foreignKey: 'fillNumber' });
        Run.hasMany(models.EorReason, { as: 'eorReasons' });
    };

    return Run;
};
