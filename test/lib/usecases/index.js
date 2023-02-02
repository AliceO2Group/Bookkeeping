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

const EnvironmentSuite = require('./environment/index.js');
const StatusSuite = require('./status/index.js');
const LhcFillSuite = require('./lhcFill/index.js');
const LogSuite = require('./log/index.js');
const RunSuite = require('./run/index.js');
const RunTypeSuite = require('./runType/index.js');
const FlpSuite = require('./flp/index.js');
const ServerSuite = require('./server/index.js');
const SubsystemSuite = require('./subsystem/index.js');
const TagSuite = require('./tag/index.js');

module.exports = () => {
    describe('Status use-case', StatusSuite);
    describe('Log use-case', LogSuite);
    describe('LhcFill use-case', LhcFillSuite);
    describe('Run use-case', RunSuite);
    describe('RunType use-case', RunTypeSuite);
    describe('Flp use-case', FlpSuite);
    describe('Server use-case', ServerSuite);
    describe('Subsystem use-case', SubsystemSuite);
    describe('Tag use-case', TagSuite);
    describe('Environment use-case', EnvironmentSuite);
};
