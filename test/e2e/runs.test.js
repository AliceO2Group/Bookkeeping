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
const { server } = require('../../lib/application');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
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

        it('should return 400 if the limit is below 1', async () => {
            const response = await request(server).get('/api/runs?page[offset]=0&page[limit]=0');
            expect(response.status).to.equal(400);

            // Response must satisfy the OpenAPI specification
            expect(response).to.satisfyApiSpec;

            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
            expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
        }).timeout(1000);

        it('should return the correct number of pages', async () => {
            const response = await request(server).get('/api/runs?page[offset]=0&page[limit]=2');
            expect(response.status).to.equal(200);

            // Response must satisfy the OpenAPI specification
            expect(response).to.satisfyApiSpec;

            const totalNumber = await RunRepository.count();

            expect(response.body.data).to.have.lengthOf(2);
            expect(response.body.meta.page.pageCount).to.equal(Math.ceil(totalNumber / 2));
            expect(response.body.meta.page.totalCount).to.equal(totalNumber);
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

        it('should return 400 if the duration filter is invalid', async () => {
            const response = await request(server).get('/api/runs?filter[runDuration][operator]=invalid&filter[runDuration][limit]=10');

            expect(response.status).to.equal(400);
            expect(response).to.satisfyApiSpec;

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.runDuration.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on duration', async () => {
            const response =
                await request(server).get('/api/runs?filter[runDuration][operator]=>&filter[runDuration][limit]=0');

            expect(response.status).to.equal(200);
            expect(response).to.satisfyApiSpec;

            const { data } = response.body;
            expect(data).to.be.an('array');

            // Run 1 trigger start and stop are override in EndRunUseCase, and two runs are created with non-null duration in StartRunUseCase
            expect(data).to.have.lengthOf(4);
        });

        it('should filter run on their quality', async () => {
            const response = await request(server)
                .get('/api/runs?filter[runQualities]=bad,test');
            expect(response.status).to.equal(200);
            // Response must satisfy the OpenAPI specification
            expect(response).to.satisfyApiSpec;

            const { data } = response.body;
            // 48 because one run is added in start run use case with default quality which is test, and one is updated to quality test
            expect(data.length).to.equal(47);
        });
        it('should return 400 if "runQuality" is invalid', async () => {
            const response = await request(server)
                .get('/api/runs?filter[runQualities]=invalid');
            expect(response.status).to.equal(400);
            // Response must satisfy the OpenAPI specification
            expect(response).to.satisfyApiSpec;

            const { errors } = response.body;
            expect(errors[0].detail).to.equal('"query.filter.runQualities[0]" must be one of [good, bad, test]');
        });

        it('should return 400 if the detectors number filter is invalid', async () => {
            const response =
                await request(server).get('/api/runs?filter[nDetectors][operator]=invalid&filter[nDetectors][limit]=3');

            expect(response.status).to.equal(400);
            expect(response).to.satisfyApiSpec;

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.nDetectors.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on detectors number', async () => {
            const response =
                await request(server).get('/api/runs?filter[nDetectors][operator]=>=&filter[nDetectors][limit]=6');

            expect(response.status).to.equal(200);
            expect(response).to.satisfyApiSpec;

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.lengthOf(52);
        });

        it('should successfully filter on lhcPeriod', async () => {
            const response =
                await request(server).get('/api/runs?filter[lhcPeriods]=lhc22_b');

            expect(response.status).to.equal(200);
            expect(response).to.satisfyApiSpec;

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.lengthOf.above(1);
        });

        it('should return 400 if the FLP number filter is invalid', async () => {
            const response = await request(server).get('/api/runs?filter[nFlps][operator]=invalid&filter[nFlps][limit]=10');

            expect(response.status).to.equal(400);
            expect(response).to.satisfyApiSpec;

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.nFlps.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on FLPs number', async () => {
            const response =
                await request(server).get('/api/runs?filter[nFlps][operator]=<=&filter[nFlps][limit]=10');

            expect(response.status).to.equal(200);
            expect(response).to.satisfyApiSpec;

            const { data } = response.body;
            expect(data).to.be.an('array');
            // 7 instead of 5 because 2 runs have been created with 10 as nFlps
            expect(data).to.have.lengthOf(7);
        });

        it('should return 400 if the EPN number filter is invalid', async () => {
            const response = await request(server).get('/api/runs?filter[nEpns][operator]=invalid&filter[nEpns][limit]=10');

            expect(response.status).to.equal(400);
            expect(response).to.satisfyApiSpec;

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.nEpns.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on EPNs number', async () => {
            const response =
                await request(server).get('/api/runs?filter[nEpns][operator]=<=&filter[nEpns][limit]=10');

            expect(response.status).to.equal(200);
            expect(response).to.satisfyApiSpec;

            const { data } = response.body;
            expect(data).to.be.an('array');
            // 7 instead of 5 because 2 runs have been created with 10 as nEpns
            expect(data).to.have.lengthOf(7);
        });
    });

    describe('GET /api/runs/reasonTypes', () => {
        it('should successfully return status 200 and list of reason types', async () => {
            const { body } = await request(server)
                .get('/api/runs/reasonTypes')
                .expect(200);

            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(4);

            expect(body.data[0].id).to.equal(1);
            expect(body.data[0].category).to.equal('DETECTORS');
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
        const testRun = {
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
        };

        it('should successfully return the stored run entity', (done) => {
            request(server)
                .post('/api/runs')
                .expect(201)
                .send({
                    ...testRun,
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
                    ...testRun,
                    detectors: 'CPV,UNKNOWN',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors).to.be.an('array');
                    // eslint-disable-next-line max-len
                    expect(res.body.errors[0].detail).to.equal('Error code "Provide detector list contains invalid elements" is not' +
                        ' defined, your custom type is missing the correct messages definition');

                    done();
                });
        });
        it('should return an error due to already existing run number', async () => {
            const response = await request(server)
                .post('/api/runs')
                .send({
                    ...testRun,
                });

            expect(response.status).to.equal(409);
            expect(response.body.errors).to.be.an('array');
            expect(response.body.errors[0].detail).to.equal('A run already exists with run number 109');
        });
    });

    describe('PUT /api/runs/:runId', () => {
        it('should return 200 in all other cases', (done) => {
            request(server)
                .put('/api/runs/9999999999')
                .send({
                    runQuality: 'bad',
                })
                .expect(500)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].detail).to.equal('Run with this id (9999999999) could not be found');

                    done();
                });
        });
        it('should return 201 in all other cases', (done) => {
            request(server)
                .put('/api/runs/1')
                .send({
                    runQuality: 'bad',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.data.runQuality).to.equal('bad');
                    done();
                });
        });

        it('should successfully return the updated run entity with new runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/runs/1')
                .expect(201)
                .send({
                    runQuality: 'good',
                });
            expect(body.data).to.be.an('object');
            expect(body.data.id).to.equal(1);
            expect(body.data.runQuality).to.equal('good');
        });

        it('should return an error due to invalid runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/runs/1')
                .expect(400)
                .send({
                    runQuality: 'wrong',
                });
            expect(body.errors).to.be.an('array');
            expect(body.errors[0].detail).to.equal('"body.runQuality" must be one of [good, bad, test]');
        });

        it('should return an error due to invalid eorReasons list', async () => {
            const { body } = await request(server)
                .put('/api/runs/1')
                .expect(400)
                .send({
                    eorReasons: [
                        {
                            description: 'Some',
                            runId: '1a',
                            reasonTypeId: 1,
                            lastEditedName: 'Anonymous',
                        },
                    ],
                });
            expect(body.errors).to.be.an('array');
            expect(body.errors[0].detail).to.equal('"body.eorReasons[0].runId" must be a number');
        });

        it('should successfully return the updated run entity with new runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/runs/106')
                .expect(201)
                .send({
                    runQuality: 'good',
                });
            expect(body.data).to.be.an('object');
            expect(body.data.id).to.equal(106);
            expect(body.data.runQuality).to.equal('good');
        });

        it('should successfully add eorReasons to run and check runQuality did not change', async () => {
            const currentRun = await request(server)
                .get('/api/runs/106')
                .expect(200);
            expect(currentRun.body.data).to.be.an('object');
            expect(currentRun.body.data.id).to.equal(106);
            expect(currentRun.body.data.runQuality).to.equal('good');
            expect(currentRun.body.data.eorReasons).to.have.lengthOf(0);

            const { body } = await request(server)
                .put('/api/runs/106')
                .expect(201)
                .send({
                    eorReasons: [
                        {
                            description: 'Some',
                            runId: 106,
                            reasonTypeId: 1,
                            lastEditedName: 'Anonymous',
                        },
                    ],
                });
            expect(body.data).to.be.an('object');
            expect(body.data.id).to.equal(106);
            expect(body.data.eorReasons).to.have.lengthOf(1);
            expect(body.data.eorReasons[0].description).to.equal('Some');
            expect(body.data.runQuality).to.equal('good');
        });
    });

    describe('PATCH api/runs query:runNumber', () => {
        it('should return 400 if the wrong id is given', (done) => {
            request(server)
                .patch('/api/runs?runNumber=99999')
                .send({
                    lhcBeamEnergy: 232.156,
                    lhcBeamMode: 'STABLE BEAMS',
                    lhcBetaStar: 123e-5,
                    aliceL3Current: 561.2,
                    aliceL3Polarity: 'POSITIVE',
                    aliceDipoleCurrent: 45654.1,
                    aliceDipolePolarity: 'NEGATIVE',
                })
                .expect(500)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].title).to.equal('ServiceUnavailable');

                    done();
                });
        });
        it('should return 200 in all other cases', (done) => {
            request(server)
                .patch('/api/runs?runNumber=1')
                .send({
                    lhcBeamEnergy: 232.156,
                    lhcBeamMode: 'STABLE BEAMS',
                    lhcBetaStar: 123e-5,
                    aliceL3Current: 561.2,
                    aliceL3Polarity: 'positive',
                    aliceDipoleCurrent: 45654.1,
                    aliceDipolePolarity: 'negative',
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.data.runNumber).to.equal(1);
                    expect(res.body.data.lhcBeamEnergy).to.equal(232.156);
                    expect(res.body.data.lhcBeamMode).to.equal('STABLE BEAMS');
                    expect(res.body.data.lhcBetaStar).to.equal(123e-5);
                    expect(res.body.data.aliceL3Current).to.equal(561.2);
                    expect(res.body.data.aliceL3Polarity).to.equal('POSITIVE');
                    expect(res.body.data.aliceDipoleCurrent).to.equal(45654.1);
                    expect(res.body.data.aliceDipolePolarity).to.equal('NEGATIVE');
                    done();
                });
        });
    });
    describe('PATCH api/runs/:runNumber', () => {
        const dateValue = new Date('1-1-2021').setHours(0, 0, 0, 0);
        it('should return 400 when runNumber is wrong', (done) => {
            request(server)
                .patch('/api/runs/9999999999')
                .send({
                    timeO2End: dateValue,
                    timeTrgEnd: dateValue,
                    runQuality: 'good',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].title).to.equal('run with this id (9999999999) could not be found');

                    done();
                });
        });
        it('should successfully update a run by its RunNumber with partial information', (done) => {
            request(server)
                .patch('/api/runs/1')
                .send({
                    timeO2End: dateValue,
                    timeTrgEnd: dateValue,
                    runQuality: 'good',
                    lhcPeriod: 'lhc22_b',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.data.id).to.equal(1);
                    expect(res.body.data.timeO2End).to.equal(dateValue);
                    expect(res.body.data.timeTrgEnd).to.equal(dateValue);
                    expect(res.body.data.runQuality).to.equal('good');
                    expect(res.body.data.lhcPeriod).to.equal('lhc22_b');
                    done();
                });
        });

        it('should successfully update a run by its RunNumber with partial information and keep previous updated values the same', async () => {
            const { body } = await request(server)
                .patch('/api/runs/1')
                .expect(201)
                .send({
                    timeO2Start: dateValue,
                    timeTrgStart: dateValue,
                    pdpConfigOption: 'Repository hash',
                    trgGlobalRunEnabled: true,
                    trgEnabled: false,
                    pdpTopologyDescriptionLibraryFile: 'production/production.desc',
                    tfbDdMode: 'processing',
                    lhcPeriod: 'lhc22_b',
                });
            expect(body.data).to.be.an('object');
            expect(body.data.timeO2End).to.equal(dateValue); // Values not passed should remain the same
            expect(body.data.timeO2Start).to.equal(dateValue); // Values not passed should remain the same
            expect(body.data.timeTrgStart).to.equal(dateValue);
            expect(body.data.timeTrgEnd).to.equal(dateValue);
            expect(body.data.runQuality).to.equal('good'); // Values not passed should remain the same
            expect(body.data.pdpConfigOption).to.equal('Repository hash');
            expect(body.data.trgGlobalRunEnabled).to.equal(true);
            expect(body.data.trgEnabled).to.equal(false);
            expect(body.data.pdpTopologyDescriptionLibraryFile).to.equal('production/production.desc');
            expect(body.data.tfbDdMode).to.equal('processing');
            expect(body.data.lhcPeriod).to.equal('lhc22_b');
        });
    });
};
