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
    const { server } = require('../../lib/application');

    describe('GET /api/environments', () => {
        it('should return 201 if valid data is provided', (done) => {
            request(server)
                .get('/api/environments')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');

                    done();
                });
        });
    });
    describe('POST /api/environments', () => {
        const createdAtDate = new Date().setMilliseconds(0);
        it('should return 201 if valid data is provided', (done) => {
            request(server)
                .post('/api/environments')
                .expect(201)
                .send({
                    envId: 'New original env',
                    createdAt: createdAtDate,
                    status: 'STARTED',
                    statusMessage: 'This is going very good',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    const { data } = res.body;
                    expect(data.id).to.equal('New original env');
                    expect(data.createdAt).to.equal(createdAtDate);
                    expect(data.status).to.equal('STARTED');
                    expect(data.statusMessage).to.equal('This is going very good');
                    done();
                });
        });
        it('should return 400 if no id is provided', (done) => {
            request(server)
                .post('/api/environments')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/envId');
                    expect(titleError.detail).to.equal('"body.envId" is required');

                    done();
                });
        });
        it('should return 400 if createdAt is no date', (done) => {
            request(server)
                .post('/api/environments')
                .expect(400)
                .send({
                    envId: 'Cake environments',
                    createdAt: 'This is no date',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/createdAt');
                    expect(titleError.detail).to.equal('"body.createdAt" must be a valid date');

                    done();
                });
        });
        it('should return 400 if id already exists', (done) => {
            request(server)
                .post('/api/environments')
                .send({
                    envId: 'Dxi029djX',
                })
                .expect(409)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    done();
                });
        });
    });
    describe('PUT /api/environment/:envId', () => {
        const toredownDate = new Date().setMilliseconds('0');
        it('should return 400 if the wrong id is provided', (done) => {
            request(server)
                .put('/api/environments/99999')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    done();
                });
        });
        it('should return 400 if run is not found', (done) => {
            request(server)
                .put('/api/environments/KGIS12DS')
                .send({
                    run: 9999999999,
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].title).to.equal('Run with this id (9999999999) could not be found');
                    done();
                });
        });
        it('should return 201 if valid data is given', (done) => {
            request(server)
                .put('/api/environments/KGIS12DS')
                .send({
                    run: 1,
                    toredownAt: toredownDate,
                    status: 'STOPPED',
                    statusMessage: 'This is a good environment.',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.data.runs[0].id).to.equal(1);
                    expect(res.body.data.status).to.equal('STOPPED');
                    expect(res.body.data.toredownAt).to.equal(toredownDate);
                    expect(res.body.data.statusMessage).to.equal('This is a good environment.');
                    done();
                });
        });
    });
};
