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

const AttachmentsSuite = require('./attachments.test');
const HomeSuite = require('./home.test');
const LogsSuite = require('./logs.test');
const SubsystemsSuite = require('./subsystems.test');
const TagsSuite = require('./tags.test');

module.exports = () => {
    describe('Home', HomeSuite);
    describe('Logs', LogsSuite);
    describe('Subsystems', SubsystemsSuite);
    describe('Tags', TagsSuite);
    describe('Attachments', AttachmentsSuite);
};
