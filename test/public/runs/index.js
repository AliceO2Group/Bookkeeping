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

const OverviewSuite = require('./overview.test');
const DetailSuite = require('./detail.test');
const RunsPerPeriodOverviewSuite = require('./runsPerLhcPeriod.overview.test');
const RunsPerDataPassOverviewPage = require('./runsPerDataPass.overview.test');
const RunsPerSimulationPassOverviewPage = require('./runsPerSimulationPass.overview.test');

module.exports = () => {
    describe('Overview Page', OverviewSuite);
    describe('Detail Page', DetailSuite);
    describe('Runs Per LHC Period Overview Page', RunsPerPeriodOverviewSuite);
    describe('Runs Per Data Pass Overview Page', RunsPerDataPassOverviewPage);
    describe('Runs Per Simulation Pass Overview Page', RunsPerSimulationPassOverviewPage);
};
