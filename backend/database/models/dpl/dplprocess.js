/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const DplProcess = sequelize.define('DplProcess', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        typeId: {
            type: Sequelize.STRING,
        },
    }, {
        tableName: 'dpl_processes',
        name: { plural: 'DplProcesses' },
        indexes: [
            {
                unique: true,
                fields: ['name', 'typeId'],
            },
        ],
    });

    DplProcess.associate = (models) => {
        DplProcess.belongsTo(models.DplProcessType, { as: 'type' });
        DplProcess.hasMany(models.DplProcessExecution, { as: 'processesExecutions', foreignKey: 'processId' });
    };

    return DplProcess;
};
