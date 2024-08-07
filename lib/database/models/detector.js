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
    const Detector = sequelize.define('Detector', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.CHAR(64),
            allowNull: false,
        },
        type: {
            type: Sequelize.ENUM('PHYSICAL', 'QC', 'VIRTUAL'),
            allowNull: false,
        },
    });

    Detector.associate = (models) => {
        Detector.belongsToMany(models.Run, {
            through: models.RunDetectors,
            as: 'runs',
            foreignKey: 'detectorId',
            otherKey: 'runNumber',
        });
        Detector.hasMany(models.DplProcessExecution, { as: 'processesExecutions', foreignKey: 'detectorId' });
    };

    return Detector;
};
