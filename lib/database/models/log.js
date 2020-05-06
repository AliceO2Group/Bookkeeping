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

module.exports = (sequelize, Sequelize) => {
    // eslint-disable-next-line require-jsdoc
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
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
    }, {});

    return Log;
};
