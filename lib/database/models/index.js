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

const Attachment = require('./attachment');
const EpnRoleSession = require('./epnrolesession');
const FlpRoles = require('./flprole');
const Log = require('./log');
const Run = require('./run');
const Subsystem = require('./subsystem');
const Tag = require('./tag');
const User = require('./user');
const Environment = require('./environment');
const EorReason = require('./eorreason');

module.exports = (sequelize) => {
    const models = {
        Attachment: Attachment(sequelize),
        Environment: Environment(sequelize),
        EorReason: EorReason(sequelize),
        EpnRoleSessionkey: EpnRoleSession(sequelize),
        FlpRoles: FlpRoles(sequelize),
        Log: Log(sequelize),
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
