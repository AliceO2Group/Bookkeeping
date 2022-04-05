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
const { CreateEnvironmentDto } = require('../../lib/domain/dtos');
const { CreateEnvironmentUseCase } = require('../../lib/usecases/environment');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const { server } = require('../../lib/application');

    describe('POST /api/environment', () => {
        const createdAtDate = new Date();
        it('should return 201 if valid data is profided', (done) => {
            request(server)
                .post('/api/environment')
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

                    expect(res.body.id).to.equal('New original env');
                    expect(res.body.createdAt).to.equal(createdAtDate);
                    expect(res.body.status).to.equal('STARTED');
                    expect(res.body.statusMessage).to.equal('This is going very good');
                    done();
                });
        });
        it('should return 400 if no id is provided', (done) => {
            request(server)
                .post('/api/environment')
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
                .post('/api/environment')
                .expect(400)
                .send({
                    envId: 'Cake environment',
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
                    expect(titleError.detail).to.equal('"body.createdAt" is required');

                    done();
                });
        });
        it('should return 400 if id already exists', (done) => {
            request(server)
                .post('/api/environment')
                .send({
                    envId: 'first',
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
        let createdEnv;
        const toredownDate = new Date();
        beforeEach(async () => {
            const createEnvDto = await CreateEnvironmentDto.validateAsync({
                body: {
                    envId: `ENV#${new Date().getTime()}`,
                },
            });
            createdEnv = await new CreateEnvironmentUseCase()
                .execute(createEnvDto);
        });
        it('should return 400 if the wrong id is provided', (done) => {
            request(server)
                .put('/api/environment/99999')
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
                .put(`/api/environment/${createdEnv.envId}`)
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
                    done();
                });
        });
        it('should return 201 if valid data is given', (done) => {
            request(server)
                .put(`/api/environment/${createdEnv.envId}`)
                .send({
                    run: 1,
                    toredown: toredownDate,
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
                    expect(res.body.runs.includes(1)).to.equal(true);
                    expect(res.body.status).to.equal('STOPPED');
                    expect(res.body.toredownAt).to.equal(toredownDate);
                    expect(res.body.statusMessage).to.equal('This is a good environment.');
                    done();
                });
        });
    });
};
