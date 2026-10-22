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
    const CtpTriggerCounters = sequelize.define('CtpTriggerCounters', {
        id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
        },
        timestamp: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        runNumber: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        className: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        // LM Before
        lmb: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        // LM After
        lma: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l0b: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l0a: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l1b: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l1a: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
    }, { indexes: [{ unique: true, fields: ['runNumber', 'className'] }] });

    CtpTriggerCounters.associate = (models) => {
        CtpTriggerCounters.belongsTo(models.Run, { as: 'run', targetKey: 'runNumber', foreignKey: 'runNumber' });
    };

    return CtpTriggerCounters;
};
