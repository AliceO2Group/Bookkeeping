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

const DetectorSuite = require('./detector/index.js');
const DplSuite = require('./dpl/index.js');
const Environment = require('./environment/index.js');
const EnvironmentHistoryItemSuite = require('./environmentHistoryItem/index.js');
const EosReportSuite = require('./eosReport/index.js');
const FlpRoleSuite = require('./flpRole');
const LogSuite = require('./log');
const RunSuite = require('./run/index.js');
const RunTypeSuite = require('./runType/index.js');
const ShiftSuite = require('./shift/index.js');

module.exports = () => {
    describe('Detector', DetectorSuite);
    describe('DPL', DplSuite);
    describe('Environment', Environment);
    describe('Environment history item', EnvironmentHistoryItemSuite);
    describe('EOS report', EosReportSuite);
    describe('Flp role', FlpRoleSuite);
    describe('Logs', LogSuite);
    describe('RunType', RunTypeSuite);
    describe('Run', RunSuite);
    describe('Shift', ShiftSuite);
};
