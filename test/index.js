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

const ApplicationSuite = require('./application');
const FrameworkSuite = require('./framework');
const PublicSuite = require('./public');
const OpenApiSuite = require('./openapi.test');
const EndToEndSuite = require('./e2e');

describe('Bookkeeping', () => {
    describe('Application', ApplicationSuite);
    describe('Framework', FrameworkSuite);
    describe('OpenAPI Specification', OpenApiSuite);
    describe('Public', PublicSuite);
    describe('E2E', EndToEndSuite);
});
