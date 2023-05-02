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
    const DplProcessExecution = sequelize.define('DplProcessExecution', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        runNumber: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'runs',
                key: 'run_number',
            },
        },
        detectorId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'dpl_detectors',
                key: 'id',
            },
        },
        hostId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'hosts',
                key: 'id',
            },
        },
        processId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'dpl_processes',
                key: 'id',
            },
        },
        arguments: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }, { tableName: 'dpl_processes_executions', name: { plural: 'DplProcessesExecutions' } });

    DplProcessExecution.associate = (models) => {
        DplProcessExecution.belongsTo(models.DplDetector, { as: 'detector' });
        DplProcessExecution.belongsTo(models.DplProcess, { as: 'process' });
        DplProcessExecution.belongsTo(models.Host, { as: 'host' });
        DplProcessExecution.belongsTo(models.Run, { as: 'run', foreignKey: 'runNumber' });
    };

    return DplProcessExecution;
};
