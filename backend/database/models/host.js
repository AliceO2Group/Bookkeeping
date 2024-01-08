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
    const Host = sequelize.define(
        'Host',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            hostname: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        { indexes: [{ unique: true, fields: ['hostname'] }] },
    );

    Host.associate = (models) => {
        Host.hasMany(models.DplProcessExecution, { as: 'processesExecutions', foreignKey: 'hostId' });
    };

    return Host;
};
