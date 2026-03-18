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

    const GaqSummary = sequelize.define('GaqSummary', {
        dataPassId: {
            type: Sequelize.INTEGER,
        },
        runNumber: {
            type: Sequelize.INTEGER,
        },
        badRunCoverage: {
            type: Sequelize.FLOAT,
        },
        explicitlyNotBadRunCoverage: {
            type: Sequelize.FLOAT,
        },
        mcReproducibleCoverage: {
            type: Sequelize.FLOAT,
        },
        missingVerificationsCount: {
            type: Sequelize.INTEGER,
        },
        undefinedQualityPeriodsCount: {
            type: Sequelize.INTEGER,
        },
    }, { tableName: 'gaq_summaries' });

    GaqSummary.removeAttribute('id');

    GaqSummary.associate = (models) => {
        GaqSummary.belongsTo(models.Run, { foreignKey: 'runNumber', as: 'run' });
        GaqSummary.belongsTo(models.DataPass, { foreignKey: 'dataPassId', as: 'dataPass' });
    };

    return GaqSummary;
};
