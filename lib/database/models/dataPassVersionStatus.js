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
const { DATA_PASS_VERSION_STATUSES } = require('../../domain/enums/DataPassVersionStatus');

module.exports = (sequelize) => {
    const DataPassVersionStatus = sequelize.define('DataPassVersionStatus', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM(...DATA_PASS_VERSION_STATUSES),
            allowNull: false,
        },

        data_pass_version_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'data_pass_versions',
                key: 'id',
            },
        },
    }, { tableName: 'data_pass_version_status_history' });

    DataPassVersionStatus.associate = (models) => {
        DataPassVersionStatus.belongsTo(models.DataPassVersion, { as: 'dataPassVersion' });
    };

    return DataPassVersionStatus;
};
