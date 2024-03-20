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
    const QcFlagType = sequelize.define(
        'QcFlagType',
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            method: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            bad: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            color: {
                type: Sequelize.STRING(7),
                allowNull: true,
                validate: {
                    is: /^#[0-9a-fA-F]{6}$/i,
                },
            },
            archivedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            archived: {
                type: Sequelize.VIRTUAL,
                defaultValue: null,
                // eslint-disable-next-line require-jsdoc
                get() {
                    return Boolean(this.getDataValue('archivedAt'));
                },
            },
        },
        { tableName: 'quality_control_flag_types' },
    );

    QcFlagType.associate = (models) => {
        QcFlagType.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
        QcFlagType.belongsTo(models.User, { as: 'lastUpdatedBy', foreignKey: 'lastUpdatedById' });
    };

    return QcFlagType;
};
