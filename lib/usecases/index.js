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

const attachment = require('./attachment');
const environment = require('./environment');
const flp = require('./flp');
const lhcFill = require('./lhcFill');
const log = require('./log');
const run = require('./run');
const runDetector = require('./runDetector');
const runType = require('./runType');
const server = require('./server');
const status = require('./status');
const subsystem = require('./subsystem');
const tag = require('./tag');
const user = require('./user');

module.exports = {
    attachment,
    environment,
    flp,
    lhcFill,
    log,
    run,
    runDetector,
    runType,
    server,
    status,
    subsystem,
    tag,
    user,
};
