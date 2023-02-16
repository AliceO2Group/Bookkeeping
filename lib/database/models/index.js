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
const Detector = require('./detector');
const Environment = require('./environment');
const EnvironmentHistoryItem = require('./environmenthistoryitem');
const EpnRoleSession = require('./epnrolesession');
const FlpRole = require('./flprole');
const Log = require('./log');
const ReasonType = require('./reasontype');
const Run = require('./run');
const RunDetectors = require('./rundetectors.js');
const Subsystem = require('./subsystem');
const Tag = require('./tag');
const User = require('./user');
const EorReason = require('./eorreason');
const LhcFill = require('./lhcFill');
const RunType = require('./runType');

module.exports = (sequelize) => {
    const models = {
        Attachment: Attachment(sequelize),
        Detector: Detector(sequelize),
        Environment: Environment(sequelize),
        EnvironmentHistoryItem: EnvironmentHistoryItem(sequelize),
        EorReason: EorReason(sequelize),
        EpnRoleSessionkey: EpnRoleSession(sequelize),
        FlpRole: FlpRole(sequelize),
        Log: Log(sequelize),
        ReasonType: ReasonType(sequelize),
        Run: Run(sequelize),
        RunDetectors: RunDetectors(sequelize),
        Subsystem: Subsystem(sequelize),
        Tag: Tag(sequelize),
        User: User(sequelize),
        LhcFill: LhcFill(sequelize),
        RunType: RunType(sequelize),
    };

    Object.entries(models).forEach(([_key, model]) => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });

    return models;
};
