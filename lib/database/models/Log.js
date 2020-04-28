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
    // eslint-disable-next-line require-jsdoc
    class Log extends Sequelize.Model { }

    Log.init({
        title: {
            allowNull: false,
            type: Sequelize.STRING,
        },
    }, {
        sequelize,
    });

    Log.sync().then(() => Log.create({
        title: 'Run #' + Math.floor(Math.random() * 1000),
    }));

    return Log;
};
