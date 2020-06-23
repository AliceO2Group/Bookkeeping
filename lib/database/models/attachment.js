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

    const Attachment = sequelize.define('attachment', {
        fileName: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        size: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        mimeType: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        originalName: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        path: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        encoding: {
            allowNull: false,
            type: Sequelize.STRING,
        },
    }, {
        indexes: [
            {
                name: 'attachments_mime_type_idx',
                fields: ['mime_type'],
            },
        ],
    });

    Attachment.associate = (models) => {
        Attachment.belongsTo(models.Log, { as: 'log' });
    };

    return Attachment;
};
