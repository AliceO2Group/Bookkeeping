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
    const RunType = sequelize.define('RunType', {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.CHAR(64),
            default: null,
        },
    });

    RunType.associate = (models) => {
        RunType.hasMany(models.Run, {
            as: 'runs',
            foreignKey: 'runTypeId',
        });
    };

    return RunType;
};
