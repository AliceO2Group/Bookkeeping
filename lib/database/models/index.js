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

const EpnRoleSession = require('./epnrolesession');
const FlpRole = require('./flprole');
const Log = require('./log');
const LogTags = require('./logtag');
const Run = require('./run');
const Subsystem = require('./subsystem');
const Tag = require('./tag');
const User = require('./user');

module.exports = (sequelize) => {
    const models = {
        EpnRoleSessionkey: EpnRoleSession(sequelize),
        FlpRole: FlpRole(sequelize),
        Log: Log(sequelize),
        LogTags: LogTags(sequelize),
        Run: Run(sequelize),
        Subsystem: Subsystem(sequelize),
        Tag: Tag(sequelize),
        User: User(sequelize),
    };

    Object.entries(models).forEach(([_key, model]) => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });

    return models;
};
