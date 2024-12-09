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

const LhcFillsSuite = require('./lhcFills');
const LogsSuite = require('./logs');
const RunsSuite = require('./runs');
const TagsSuite = require('./tags');
const FlpsSuite = require('./flps');
const HomeSuite = require('./home');
const AboutSuite = require('./about');
const EnvsSuite = require('./envs');
const EosReportSuite = require('./eosReport');
const LhcPeriodsSuite = require('./lhcPeriods');
const DataPassesSuite = require('./dataPasses');
const SimulationPassesSuite = require('./simulationPasses');
const QcFlagTypesSuite = require('./qcFlagTypes');
const QcFlagsSuite = require('./qcFlags');

module.exports = () => {
    // describe('LhcPeriods', LhcPeriodsSuite);
    // describe('LhcFills', LhcFillsSuite);
    // describe('Logs', LogsSuite);
    // describe('Envs', EnvsSuite);
    describe('Runs', RunsSuite);
    // describe('Tags', TagsSuite);
    // describe('Flps', FlpsSuite);
    // describe('Home', HomeSuite);
    // describe('About', AboutSuite);
    // describe('EosReport', EosReportSuite);
    // describe('DataPasses', DataPassesSuite);
    // describe('SimulationPasses', SimulationPassesSuite);
    // describe('QcFlagTypes', QcFlagTypesSuite);
    // describe('QcFlags', QcFlagsSuite);
};
