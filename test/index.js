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

const DatabaseSuite = require('./lib/database');
const PresentationSuite = require('./presentation');
const PublicSuite = require('./lib/public');
const ServerSuite = require('./lib/server');
const UseCasesSuite = require('./lib/usecases');
const UtilitiesSuite = require('./lib/utilities');
const GrpcSuite = require('./gRPC');

const APISuite = require('./api');
const FrontendSuite = require('./public');

const application = require('../lib/application');

describe('Bookkeeping', () => {
    before(async () => {
        await application.run();
        await application.connectDatabase();
    });

    after(async () => {
        await application.stop(true);
    });

    describe('Unit Suite', () => {
        describe('Database', DatabaseSuite);
        describe('Presentation', PresentationSuite);
        describe('Public', PublicSuite);
        describe('Server', ServerSuite);
        describe('Use Cases', UseCasesSuite);
        describe('Utilities', UtilitiesSuite);
        describe('gRPC suite', GrpcSuite);
    });

    describe('Integration Suite', () => {
        describe('UI', FrontendSuite);
        describe('API', APISuite);
    });
});
