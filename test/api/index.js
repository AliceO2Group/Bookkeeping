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

const AttachmentsSuite = require('./attachments.test.js');
const DetectorsSuite = require('./detectors.test.js');
const EnvironmentsSuite = require('./environments.test.js');
// TODO [O2B-805] const FlpSuite = require('./flps.test.js');
const StatusSuite = require('./status.test.js');
const LogsSuite = require('./logs.test.js');
const LhcFillSuite = require('./lhcFills.test.js');
const SubsystemsSuite = require('./subsystems.test.js');
const TagsSuite = require('./tags.test.js');
const RunsSuite = require('./runs.test.js');
const RunTypesSuite = require('./runTypes.test.js');

module.exports = () => {
    describe('Attachments API', AttachmentsSuite);
    describe('Detectors API', DetectorsSuite);
    describe('Environments API', EnvironmentsSuite);
    // TODO [O2B-805] describe('FLP API', FlpSuite);
    describe('LhcFills API', LhcFillSuite);
    describe('Logs API', LogsSuite);
    describe('Runs API', RunsSuite);
    describe('RunTypes API', RunTypesSuite);
    describe('Status API', StatusSuite);
    describe('Subsystems API', SubsystemsSuite);
    describe('Tags API', TagsSuite);
};
