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
                const timeTriggerEnd = this.getDataValue('timeTrgEnd');
                const o2Start = this.getDataValue('timeO2Start');
                const o2End = this.getDataValue('timeO2End');

                // Case if there is no trigger for the run
                if (timeTriggerStart === null) {
                    // Case if there is no o2 nor trigger start
                    if (!o2Start) {
                        return null;
                    }
                    return o2End - o2Start;
                }

                if (!timeTriggerEnd) {
                    // Case if the run is stopped but there is no trigger end time
                    if (o2End) {
                        return o2End - timeTriggerStart;
                    }
                    //Case if the run is still running
                    return new Date().getTime() - timeTriggerStart;
                }
                // Case if there is a trigger end and a start
                return timeTriggerEnd - timeTriggerStart;
            },
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
        Run.belongsToMany(models.Log, { through: 'log_runs' });
        Run.belongsToMany(models.FlpRoles, { through: 'flp_runs' });
        Run.belongsToMany(models.Tag, { through: 'run_tags', as: 'tags' });
        Run.hasOne(models.LhcFill, { foreignKey: 'fillNumber' });
        Run.hasMany(models.EorReason, { as: 'eorReasons' });
        Run.hasOne(models.LhcFill, { foreignKey: 'fillNumber' });
    };

    return Run;
};
