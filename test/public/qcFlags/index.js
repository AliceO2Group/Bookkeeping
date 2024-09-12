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

const SynchronousOverviewSuite = require('./synchronousOverview.test');
const ForDataPassOverviewSuite = require('./forDataPassOverview.test');
const ForSimulationPassOverviewSuite = require('./forSimulationPassOverview.test');
const ForDataPassCreationSuite = require('./forDataPassCreation.test');
const ForSimulationPassCreationSuite = require('./forSimulationPassCreation.test');
const DetailsForDataPassPageSuite = require('./detailsForDataPass.test');
const DetailsForSimulationPassPageSuite = require('./detailsForSimulationPass.test');
const GaqOverviewPageSuite = require('./gaqOverview.test');

module.exports = () => {
    describe('Details For Data Pass Page', DetailsForDataPassPageSuite);
    describe('Details For Simulation Pass Page', DetailsForSimulationPassPageSuite);
    describe('Synchronous Overview Page', SynchronousOverviewSuite);
    describe('For Data Pass Overview Page', ForDataPassOverviewSuite);
    describe('For Simulation Pass Overview Page', ForSimulationPassOverviewSuite);
    describe('For Data Pass Creation Page', ForDataPassCreationSuite);
    describe('For Simulation Pass Creation Page', ForSimulationPassCreationSuite);
    describe('GAQ Overview page', GaqOverviewPageSuite);
};
