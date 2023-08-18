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

    const LhcFill = sequelize.define('LhcFill', {
        fillNumber: {
            primaryKey: true,
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        stableBeamsStart: {
            type: Sequelize.DATE,
            allowNull: true,
            default: null,
        },
        stableBeamsEnd: {
            type: Sequelize.DATE,
            allowNull: true,
            default: null,
        },
        stableBeamsDuration: {
            type: Sequelize.INTEGER,
            allowNull: true,
            default: null,
        },
        beamType: {
            type: Sequelize.CHAR(64),
            allowNull: true,
            default: null,
        },
        fillingSchemeName: {
            type: Sequelize.CHAR(64),
            allowNull: true,
            default: null,
        },
    });

    LhcFill.associate = (models) => {
        LhcFill.hasMany(models.Run, {
            as: 'runs',
            foreignKey: {
                name: 'fillNumber',
            } });

        LhcFill.belongsToMany(models.Log, {
            as: 'logs',
            through: 'log_lhc_fills',
            foreignKey: {
                name: 'fill_number',
            } });
    };

    return LhcFill;
};
