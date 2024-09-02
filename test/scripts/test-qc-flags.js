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

const application = require('../../lib/application');
const SynchronousOverviewSuite = require('../public/qcFlags/synchronousOverview.test');
const ForDataPassOverviewSuite = require('../public/qcFlags/forDataPassOverview.test');
const ForSimulationPassOverviewSuite = require('../public/qcFlags/forSimulationPassOverview.test');
const ForDataPassCreationSuite = require('../public/qcFlags/forDataPassCreation.test');
const ForSimulationPassCreationSuite = require('../public/qcFlags/forSimulationPassCreation.test');
const DetailsForDataPassPageSuite = require('../public/qcFlags/detailsForDataPass.test');
const DetailsForSimulationPassPageSuite = require('../public/qcFlags/detailsForSimulationPass.test');
const GaqOverviewPageSuite = require('../public/qcFlags/gaqOverview.test');

describe('Bookkeeping', () => {
    before(async () => {
        await application.run();
        await application.connectDatabase();
    });

    after(async () => {
        await application.stop(true);
    });

    describe('QcFlags', () => {
        describe('Synchronous Overview Page', SynchronousOverviewSuite);
        describe('For Data Pass Overview Page', ForDataPassOverviewSuite);
        describe('For Simulation Pass Overview Page', ForSimulationPassOverviewSuite);
        describe('For Data Pass Creation Page', ForDataPassCreationSuite);
        describe('For Simulation Pass Creation Page', ForSimulationPassCreationSuite);
        describe('Details For Data Pass Page', DetailsForDataPassPageSuite);
        describe('Details For Simulation Pass Page', DetailsForSimulationPassPageSuite);
        describe('GAQ overview page', GaqOverviewPageSuite);
    });
});
