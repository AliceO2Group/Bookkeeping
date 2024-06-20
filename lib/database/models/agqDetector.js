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

    const AgqDetector = sequelize.define('AgqDetector', {
        dataPassId: {
            type: Sequelize.INTEGER,
        },
        runNumber: {
            type: Sequelize.INTEGER,
        },
        dplDetectorId: {
            type: Sequelize.INTEGER,
        },
    }, { tableName: 'aggregated_global_quality_detectors' });

    AgqDetector.removeAttribute('id');

    AgqDetector.associate = (models) => {
        AgqDetector.belongsTo(models.Run, { foreignKey: 'runNumber', as: 'run' });
        AgqDetector.belongsTo(models.DplDetector, { foreignKey: 'dplDetectorId', as: 'dplDetector' });
        AgqDetector.belongsTo(models.DataPass, { foreignKey: 'dataPassId', as: 'dataPass' });
    };

    return AgqDetector;
};
