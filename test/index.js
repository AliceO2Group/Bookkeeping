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

const DatabaseSuite = require('./database');
const EndToEndSuite = require('./e2e');
const PublicSuite = require('./public');
const ServerSuite = require('./server');
const UseCasesSuite = require('./usecases');
const UtilitiesSuite = require('./utilities');
const OpenApiSuite = require('./openapi.test');

describe('Bookkeeping', () => {
    const application = require('../lib/application');

    before(async () => {
        await application.run();
    });

    after(async () => {
        await application.stop(true);
    });

    describe('Unit Suite', () => {
        describe('Database', DatabaseSuite);
        describe('Server', ServerSuite);
        describe('Use Cases', UseCasesSuite);
        describe('Utilities', UtilitiesSuite);
        describe('OpenAPI Specification', OpenApiSuite);
    });

    describe('Integration Suite', () => {
        describe('UI', PublicSuite);
        describe('API', EndToEndSuite);
    });
});
