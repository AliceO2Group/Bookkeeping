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

const EnvironmentSuite = require('./environment');
const StatusSuite = require('./status');
const LogSuite = require('./log');
const RunSuite = require('./run');
const FlpSuite = require('./flp');
const ServerSuite = require('./server');
const SubsystemSuite = require('./subsystem');
const TagSuite = require('./tag');

module.exports = () => {
    describe('Status', StatusSuite);
    describe('Log', LogSuite);
    describe('Run', RunSuite);
    describe('Flp', FlpSuite);
    describe('Server', ServerSuite);
    describe('Subsystem', SubsystemSuite);
    describe('Tag', TagSuite);
    describe('Environment', EnvironmentSuite);
};
