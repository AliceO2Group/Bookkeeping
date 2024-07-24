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
const { RUN_QUALITIES, RunQualities } = require('../../domain/enums/RunQualities.js');
const { RUN_DEFINITIONS } = require('../../server/services/run/getRunDefinition.js');
const { RUN_CALIBRATION_STATUS } = require('../../domain/enums/RunCalibrationStatus.js');

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
        startTime: {
            type: Sequelize.VIRTUAL,
            // eslint-disable-next-line jsdoc/require-jsdoc
            get() {
                const timeTrgStart = this.getDataValue('timeTrgStart');
                const timeO2Start = this.getDataValue('timeO2Start');
                const runStartString = timeTrgStart ?? timeO2Start;
                return runStartString ? new Date(runStartString).getTime() : null;
            },
        },
        endTime: {
            type: Sequelize.VIRTUAL,
            // eslint-disable-next-line jsdoc/require-jsdoc
            get() {
                if (this.getDataValue('start') === null) {
                    return null;
                }

                const timeTrgEnd = this.getDataValue('timeTrgEnd');
                const timeO2End = this.getDataValue('timeO2End');

                const runEndString = timeTrgEnd ?? timeO2End;

                return (runEndString ? new Date(runEndString) : new Date()).getTime();
            },
        },
        runDuration: {
            type: Sequelize.VIRTUAL,
            // eslint-disable-next-line jsdoc/require-jsdoc
            get() {
                const { startTime, endTime } = this;
                if (!startTime) {
                    return null;
                }
                return endTime - startTime;
            },
        },
        environmentId: {
            type: Sequelize.STRING,
        },
        runQuality: {
            type: Sequelize.ENUM(...RUN_QUALITIES),
            default: RunQualities.NONE,
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
        concatenatedDetectors: {
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
        pdpWorkflowParameters: {
            type: Sequelize.STRING,
            default: null,
        },
        pdpBeamType: {
            type: Sequelize.STRING,
            default: null,
        },
        readoutCfgUri: {
            type: Sequelize.STRING,
            default: null,
        },
        startOfDataTransfer: {
            type: Sequelize.DATE,
            default: null,
        },
        endOfDataTransfer: {
            type: Sequelize.DATE,
            default: null,
        },
        ctfFileCount: {
            type: Sequelize.INTEGER,
            default: null,
        },
        ctfFileSize: {
            type: Sequelize.BIGINT,
            default: null,
        },
        tfFileCount: {
            type: Sequelize.INTEGER,
            default: null,
        },
        tfFileSize: {
            type: Sequelize.BIGINT,
            default: null,
        },
        otherFileCount: {
            type: Sequelize.INTEGER,
            default: null,
        },
        otherFileSize: {
            type: Sequelize.BIGINT,
            default: null,
        },
        definition: {
            type: Sequelize.ENUM(...RUN_DEFINITIONS),
        },
        calibrationStatus: {
            type: Sequelize.ENUM(...RUN_CALIBRATION_STATUS),
            default: null,
        },
        // Link to id of the user (not externalId)
        userIdO2Start: {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
        },
        userIdO2Stop: {
            allowNull: true,
            type: Sequelize.INTEGER,
            default: null,
        },
        inelasticInteractionRateAvg: {
            type: Sequelize.FLOAT,
            allowNull: true,
            default: null,
        },
        inelasticInteractionRateAtStart: {
            type: Sequelize.FLOAT,
            allowNull: true,
            default: null,
        },
        inelasticInteractionRateAtMid: {
            type: Sequelize.FLOAT,
            allowNull: true,
            default: null,
        },
        inelasticInteractionRateAtEnd: {
            type: Sequelize.FLOAT,
            allowNull: true,
            default: null,
        },
    });

    Run.associate = (models) => {
        Run.belongsTo(models.Environment, { foreignKey: 'envId' });
        Run.belongsTo(models.RunType, { as: 'runType' });
        Run.belongsToMany(models.Log, { as: 'logs', through: 'log_runs' });
        Run.hasMany(models.FlpRole, { as: 'flpRoles', sourceKey: 'runNumber', foreignKey: 'runNumber' });
        Run.belongsToMany(models.Tag, { through: 'run_tags', as: 'tags' });
        Run.belongsTo(models.LhcFill, { foreignKey: 'fillNumber', as: 'lhcFill' });
        Run.hasMany(models.EorReason, { as: 'eorReasons' });
        Run.hasMany(models.DplProcessExecution, { sourceKey: 'runNumber', foreignKey: 'runNumber' });
        Run.belongsToMany(models.Detector, {
            through: models.RunDetectors,
            as: 'detectors',
            sourceKey: 'runNumber',
            foreignKey: 'runNumber',
            otherKey: 'detectorId',
        });
        Run.belongsTo(models.LhcPeriod, { foreignKey: 'lhcPeriodId', as: 'lhcPeriod' });
        Run.belongsToMany(models.DataPass, { as: 'dataPass', sourceKey: 'runNumber', foreignKey: 'run_number', through: 'data_passes_runs' });
        Run.hasMany(models.QcFlag, { sourceKey: 'runNumber', foreignKey: 'runNumber', as: 'qcFlags' });
        Run.belongsToMany(models.SimulationPass, {
            as: 'simulationPasses',
            sourceKey: 'runNumber',
            foreignKey: 'run_number',
            through: 'simulation_passes_runs',
        });
    };

    return Run;
};
