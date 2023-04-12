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

    const Tag = sequelize.define('Tag', {
        text: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        mattermost: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        last_edited_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        archivedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,
        },
        archived: {
            type: Sequelize.VIRTUAL,
            allowNull: true,
            defaultValue: null,
            // eslint-disable-next-line require-jsdoc
            get() {
                return Boolean(this.getDataValue('archivedAt'));
            },
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['text', 'archivedAt'],
            },
        ],
    });

    Tag.associate = (models) => {
        Tag.belongsToMany(models.Log, { through: 'log_tags' });
        Tag.belongsToMany(models.Run, { through: 'run_tags', as: 'runs' });
    };

    return Tag;
};
