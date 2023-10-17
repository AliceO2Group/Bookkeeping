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
const ConfigurationSuite = require('./configuration.test.js');
const DetectorsSuite = require('./detectors.test.js');
const DPLProcessSuite = require('./dplProcess.test.js');
const EnvironmentsSuite = require('./environments.test.js');
const EosReportSuite = require('./eosReport.test.js');
// TODO [O2B-805] const FlpSuite = require('./flps.test.js');
const StatusSuite = require('./status.test.js');
const LogsSuite = require('./logs.test.js');
const LhcFillSuite = require('./lhcFills.test.js');
const RunsSuite = require('./runs.test.js');
const RunTypesSuite = require('./runTypes.test.js');
const ShiftSuite = require('./shift.test.js');
const StatisticsSuite = require('./statistics.test.js');
const SubsystemsSuite = require('./subsystems.test.js');
const TagsSuite = require('./tags.test.js');

module.exports = () => {
    describe('Attachments API', AttachmentsSuite);
    describe('Configuration API', ConfigurationSuite);
    describe('Detectors API', DetectorsSuite);
    describe('DPL Process API', DPLProcessSuite);
    describe('Environments API', EnvironmentsSuite);
    describe('EOS report API', EosReportSuite);
    // TODO [O2B-805] describe('FLP API', FlpSuite);
    describe('LhcFills API', LhcFillSuite);
    describe('Logs API', LogsSuite);
    describe('Runs API', RunsSuite);
    describe('RunTypes API', RunTypesSuite);
    describe('Shift API', ShiftSuite);
    describe('Status API', StatusSuite);
    describe('Statistics suite', StatisticsSuite);
    describe('Subsystems API', SubsystemsSuite);
    describe('Subsystems API', SubsystemsSuite);
    describe('Tags API', TagsSuite);
};
