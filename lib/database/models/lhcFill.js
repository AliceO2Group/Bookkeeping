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
        stable_beams_start: {
            type: Sequelize.DATE,
            allowNull: true,
            default: null,
        },
        stable_beams_end: {
            type: Sequelize.DATE,
            allowNull: true,
            default: null,
        },
        stable_beams_duration: {
            type: Sequelize.INTEGER,
            allowNull: true,
            default: null,
        },
        beam_type: {
            type: Sequelize.ENUM('p-p', 'p-Pb', 'Pb-Pb'),
            allowNull: true,
            default: null,
        },
        filling_scheme_name: {
            type: Sequelize.CHAR(64),
            allowNull: true,
            default: null,
        },
    });

    LhcFill.associate = (models) => {
        LhcFill.hasOne(models.Run);
    };

    return LhcFill;
};
