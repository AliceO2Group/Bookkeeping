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
const { repositories: { RunRepository } } = require('../../lib/database');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const { server } = require('../../lib/application');

    describe('GET /api/runs', () => {
        it('should return an array', (done) => {
            request(server)
                .get('/api/runs')
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

        it('should support pagination, offset 0 and limit 1', (done) => {
            request(server)
                .get('/api/runs?page[offset]=0&page[limit]=1&sort[id]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].id).to.equal(1);

                    done();
                });
        });

        it('should support pagination, offset 1 and limit 1', (done) => {
            request(server)
                .get('/api/runs?page[offset]=1&page[limit]=1&sort[id]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].id).to.equal(2);

                    done();
                });
        });

        it('should return 400 if the limit is below 1', (done) => {
            request(server)
                .get('/api/runs?page[offset]=0&page[limit]=0')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
                    expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');

                    done();
                });
        });

        it('should return the correct number of pages', (done) => {
            request(server)
                .get('/api/runs?page[offset]=0&page[limit]=2')
                .expect(200)
                .end(async (err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const totalNumber = await RunRepository.count();

                    expect(res.body.data).to.have.lengthOf(2);
                    expect(res.body.meta.page.pageCount).to.equal(Math.ceil(totalNumber / 2));
                    expect(res.body.meta.page.totalCount).to.equal(totalNumber);

                    done();
                });
        });

        it('should support sorting, id DESC', (done) => {
            request(server)
                .get('/api/runs?sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect(data[0].runNumber).to.be.greaterThan(data[1].runNumber);

                    done();
                });
        });

        it('should support sorting, runNumber ASC', (done) => {
            request(server)
                .get('/api/runs?sort[id]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect(data[1].id).to.be.above(data[0].id);

                    done();
                });
        });
        it('should return 400 if "to" date is before "from" date', (done) => {
            request(server)
                .get('/api/runs?filter[o2start][from]=946771200000&filter[o2start][to]=946684800000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail).to
                        .equal('Creation date "to" cannot be before the "from" date');

                    done();
                });
        });
        it('should return 400 if "to" date is before "from" date', (done) => {
            request(server)
                .get('/api/runs?filter[o2end][from]=946771200000&filter[o2end][to]=946684800000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail).to
                        .equal('Creation date "to" cannot be before the "from" date');

                    done();
                });
        });
        it('should return 400 with 3 errors when all the wrong data is given', (done) => {
            request(server)
                .get('/api/runs?filter[o2start][from]=1896130800000&filter[o2start][to]=1893452400000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors.length).to.equal(3);
                    done();
                });
        });
    });

    describe('GET /api/runs/:runId', () => {
        it('should return 400 if the run id is not a number', (done) => {
            request(server)
                .get('/api/runs/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be a number');

                    done();
                });
        });

        it('should return 400 if the run id is not positive', (done) => {
            request(server)
                .get('/api/runs/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the run id is not a whole number', (done) => {
            request(server)
                .get('/api/runs/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the run could not be found', (done) => {
            request(server)
                .get('/api/runs/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Run with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/runs/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.id).to.equal(1);

                    done();
                });
        });
    });

    describe('GET /api/runs/:runId/logs', () => {
        it('should return 400 if the run id is not a number', (done) => {
            request(server)
                .get('/api/runs/abc/logs')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be a number');

                    done();
                });
        });

        it('should return 404 if the run could not be found', (done) => {
            request(server)
                .get('/api/runs/999999999/logs')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Run with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/runs/1/logs')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(10);

                    expect(res.body.data[0].id).to.equal(1);
                    expect(res.body.data[0].runs).to.deep.equal([
                        {
                            id: 1,
                            runNumber: 1,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('POST /api/runs', () => {
        it('should successfully return the stored run entity', (done) => {
            request(server)
                .post('/api/runs')
                .expect(201)
                .send({
                    runNumber: 109,
                    timeO2Start: '2022-03-21 13:00:00',
                    timeTrgStart: '2022-03-21 13:00:00',
                    environmentId: '1234567890',
                    runType: 'technical',
                    runQuality: 'good',
                    nDetectors: 3,
                    nFlps: 10,
                    nEpns: 10,
                    dd_flp: true,
                    dcs: true,
                    epn: true,
                    epnTopology: 'normal',
                    detectors: 'CPV',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.id).to.equal(109);

                    done();
                });
        });
        it('should return an error due to invalid detectors list', (done) => {
            request(server)
                .post('/api/runs')
                .expect(400)
                .send({
                    runNumber: 109,
                    timeO2Start: '2022-03-21 13:00:00',
                    timeTrgStart: '2022-03-21 13:00:00',
                    environmentId: '1234567890',
                    runType: 'technical',
                    runQuality: 'good',
                    nDetectors: 3,
                    nFlps: 10,
                    nEpns: 10,
                    dd_flp: true,
                    dcs: true,
                    epn: true,
                    epnTopology: 'normal',
                    detectors: 'CPV,UNKNOWN',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors).to.be.an('array');
                    // eslint-disable-next-line max-len
                    expect(res.body.errors[0].detail).to.equal('Error code "Provide detector list contains invalid elements" is not defined, your custom type is missing the correct messages definition');

                    done();
                });
        });
    });
};
