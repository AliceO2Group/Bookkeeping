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

const LogTags = require('./logtags');
const LogRuns = require('./logruns');
const RunTags = require('./runtags');
const LogLhcFills = require('./loglhcfills');

module.exports = (sequelize) => {
    const models = {
        LogTags: LogTags(sequelize),
        LogRuns: LogRuns(sequelize),
        LogLhcFills: LogLhcFills(sequelize),
        RunTags: RunTags(sequelize),
    };

    Object.entries(models).forEach(([_key, model]) => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });

    return models;
};
