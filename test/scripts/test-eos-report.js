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
const DcsCreationSuite = require('../public/eosReport/dcs-creation.test.js');
const EcsCreationSuite = require('../public/eosReport/ecs-creation.test.js');
const QcPdpCreationSuite = require('../public/eosReport/qc-pdp-creation.test.js');
const ShiftLeaderCreationSuite = require('../public/eosReport/shift-leader-creation.test.js');
const SlimosCreationSuite = require('../public/eosReport/slimos-creation.test.js');

describe('Bookkeeping', () => {
    before(async () => {
        await application.run();
    });

    after(async () => {
        await application.stop(true);
    });

    describe('EosReport', () => {
        describe('DCS Creation Page', DcsCreationSuite);
        describe('ECS Creation Page', EcsCreationSuite);
        describe('QC/PDP Creation Page', QcPdpCreationSuite);
        describe('SL Creation Page', ShiftLeaderCreationSuite);
        describe('SLIMOS Creation Page', SlimosCreationSuite);
    });
});
