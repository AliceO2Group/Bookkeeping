/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const DcsCreationSuite = require('./dcs-creation.test.js');
const EcsCreationSuite = require('./ecs-creation.test.js');
const QcPdpCreationSuite = require('./qc-pdp-creation.test.js');
const ShiftLeaderCreationSuite = require('./shift-leader-creation.test.js');
const SlimosCreationSuite = require('./slimos-creation.test.js');

module.exports = () => {
    describe('DCS Creation Page', DcsCreationSuite);
    describe('ECS Creation Page', EcsCreationSuite);
    describe('QC/PDP Creation Page', QcPdpCreationSuite);
    describe('SL Creation Page', ShiftLeaderCreationSuite);
    describe('SLIMOS Creation Page', SlimosCreationSuite);
};
