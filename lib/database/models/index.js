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
const Run = require('./run');
const Tag = require('./tag');
const User = require('./user');

module.exports = (sequelize, Sequelize) => {
    const models = {
        EpnRoleSessionkey: EpnRoleSession(sequelize, Sequelize),
        FlpRole: FlpRole(sequelize, Sequelize),
        Log: Log(sequelize, Sequelize),
        Run: Run(sequelize, Sequelize),
        Tag: Tag(sequelize, Sequelize),
        User: User(sequelize, Sequelize),
    };
    Object.entries(models).forEach(([_key, model]) => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });
    return models;
};
