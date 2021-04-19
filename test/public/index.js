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

const LogsSuite = require('./logs');
const RunsSuite = require('./runs');
const SubsystemsSuite = require('./subsystems');
const TagsSuite = require('./tags');
const FlpsSuite = require('./flps');
const HomeSuite = require('./home');
const AboutSuite = require('./about');

module.exports = () => {
    describe('Logs', LogsSuite);
    describe('Runs', RunsSuite);
    describe('Subsystems', SubsystemsSuite);
    describe('Tags', TagsSuite);
    describe('Flps', FlpsSuite);
    describe('Home', HomeSuite);
    describe('About', AboutSuite);
};
