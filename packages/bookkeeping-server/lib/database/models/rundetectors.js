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

const { RUN_DETECTOR_QUALITIES, RunDetectorQualities } = require('../../domain/enums/RunDetectorQualities.js');

module.exports = (sequelize) => {
    const Sequelize = require('sequelize');

    const RunDetectors = sequelize.define('RunDetectors', {
        runNumber: {
            type: Sequelize.INTEGER,
        },
        detectorId: {
            type: Sequelize.INTEGER,
        },
        quality: {
            type: Sequelize.ENUM(...RUN_DETECTOR_QUALITIES),
            default: RunDetectorQualities.GOOD,
        },
    });

    RunDetectors.removeAttribute('id');

    RunDetectors.associate = (models) => {
        RunDetectors.belongsTo(models.Run, { foreignKey: 'runNumber', as: 'run' });
        RunDetectors.belongsTo(models.Detector, { foreignKey: 'detectorId', as: 'detector' });
    };

    return RunDetectors;
};
