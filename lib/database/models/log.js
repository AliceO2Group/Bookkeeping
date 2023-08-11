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

    const Log = sequelize.define('Log', {
        title: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        text: {
            allowNull: false,
            type: Sequelize.TEXT,
        },
        subtype: {
            allowNull: false,
            type: Sequelize.ENUM('run', 'subsystem', 'announcement', 'intervention', 'comment'),
        },
        origin: {
            allowNull: false,
            type: Sequelize.ENUM('human', 'process'),
        },
        announcementValidUntil: {
            type: Sequelize.DATE,
        },
    }, {
        indexes: [
            {
                name: 'logs_subtype_idx',
                fields: ['subtype'],
            },
            {
                name: 'logs_origin_idx',
                fields: ['origin'],
            },
        ],
    });

    Log.associate = (models) => {
        Log.belongsTo(models.User, { as: 'user' });
        Log.belongsTo(models.Log, { as: 'rootLog' });
        Log.belongsTo(models.Log, { as: 'parentLog' });

        Log.belongsToMany(models.Run, { as: 'runs', through: 'log_runs' });
        Log.belongsToMany(models.Tag, { as: 'tags', through: 'log_tags' });
        Log.belongsToMany(models.Subsystem, { as: 'subsystems', through: 'log_subsystems' });
        Log.belongsToMany(models.LhcFill, { as: 'lhcFills', through: 'log_lhc_fills', foreignKey: 'log_id' });

        Log.hasMany(models.Attachment, { as: 'attachments', foreignKey: 'log_id' });
    };

    return Log;
};
