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

const path = require('path');
const chai = require('chai');
const request = require('supertest');
const chaiResponseValidator = require('chai-openapi-response-validator');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const application = require('../../lib/application');

    const { server } = application;

    before(async () => {
        await application.run();
    });

    after(async () => {
        await application.stop(true);
    });

    it('should return the server information when the server is not in shutdown', (done) => {
        request(server)
            .get('/api/')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res).to.satisfyApiSpec;
                done();
            });
    });

    it('should return a message when the server is not allowed to have new incoming connections', (done) => {
        server.acceptIncomingConnections(false);

        request(server)
            .get('/api/')
            .expect(503)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res).to.satisfyApiSpec;
                done();
            });
    });
};
