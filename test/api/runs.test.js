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

const { expect } = require('chai');
const request = require('supertest');
const { repositories: { RunRepository } } = require('../../lib/database');
const { server } = require('../../lib/application');
const { RunDefinition } = require('../../lib/server/services/run/getRunDefinition.js');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { RunQualities } = require('../../lib/domain/enums/RunQualities.js');
const { RunDetectorQualities } = require('../../lib/domain/enums/RunDetectorQualities.js');
const { RunCalibrationStatus } = require('../../lib/domain/enums/RunCalibrationStatus.js');
const { updateRun } = require('../../lib/server/services/run/updateRun.js');

module.exports = () => {
    before(resetDatabaseContent);

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

                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].id).to.equal(2);

                    done();
                });
        });

        it('should return 400 if the limit is below 1', async () => {
            const response = await request(server).get('/api/runs?page[offset]=0&page[limit]=0');
            expect(response.status).to.equal(400);

            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
            expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
        }).timeout(1000);

        it('should return the correct number of pages', async () => {
            const response = await request(server).get('/api/runs?page[offset]=0&page[limit]=2');
            expect(response.status).to.equal(200);

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

                    const { data } = res.body;
                    expect(data[1].id).to.be.above(data[0].id);

                    done();
                });
        });

        it('should successfully filter on calibration', async () => {
            const response = await request(server).get(`/api/runs?filter[calibrationStatuses][]=${RunCalibrationStatus.NO_STATUS}`);

            expect(response.status).to.equal(200);
            const { data: runs } = response.body;
            expect(runs).to.lengthOf(1);
            const [{ calibrationStatus }] = runs;
            expect(calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
        });

        it('should successfully filter on single specified run number', async () => {
            const response = await request(server).get('/api/runs?filter[runNumbers]=5');

            expect(response.status).to.equal(200);
            const { data: runs } = response.body;
            expect(runs).to.lengthOf(20);
        });

        it('should successfully filter on multiple specified run numbers', async () => {
            const response = await request(server).get('/api/runs?filter[runNumbers]=17,18');

            expect(response.status).to.equal(200);
            const { data: runs } = response.body;
            expect(runs).to.lengthOf(2);
        });

        it('should return 400 if the calibration status filter is invalid', async () => {
            {
                const response = await request(server).get('/api/runs?filter[calibrationStatuses]=invalid');

                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.filter.calibrationStatuses" must be an array');
            }
            {
                const response = await request(server).get('/api/runs?filter[calibrationStatuses][]=DO-NOT-EXIST');

                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.filter.calibrationStatuses[0]" does not match any of the allowed types');
            }
        });

        it('should return 400 if the detectors filter is invalid', async () => {
            const response =
                await request(server).get('/api/runs?filter[detectors][operator]=invalid&filter[detectors][values]=ITS');

            expect(response.status).to.equal(400);

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.detectors.operator" must be one of [or, and, none]');
        });

        it('should successfully filter on detectors', async () => {
            const response =
                await request(server).get('/api/runs?filter[detectors][operator]=or&filter[detectors][values]=ITS,FT0');

            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.lengthOf(8);
        });

        it('should successfully return 400 if the given definitions are not valid', async () => {
            const response = await request(server).get('/api/runs?filter[definitions]=bad,definition');
            expect(response.status).to.equal(400);

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail)
                .to
                .equal('"query.filter.definitions[0]" must be one of [PHYSICS, COSMICS, TECHNICAL, SYNTHETIC, CALIBRATION, COMMISSIONING]');
        });

        it('should successfully filter on run definition', async () => {
            const response = await request(server).get('/api/runs?filter[definitions]=physics');
            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.lengthOf(4);
            expect(data.every(({ definition }) => definition === RunDefinition.Physics)).to.be.true;
        });

        it ('should succefully filter on data pass id', async () => {
            const response = await request(server).get('/api/runs?filter[dataPassIds][]=2&filter[dataPassIds][]=3');
            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.lengthOf(7);
            expect(data.map(({ runNumber }) => runNumber)).to.have.all.members([1, 2, 55, 49, 54, 56, 105]);
        });

        it('should return 400 if o2start "to" date is before "from" date', (done) => {
            request(server)
                .get('/api/runs?filter[o2start][from]=946771200000&filter[o2start][to]=946684800000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    expect(errors[0].detail).to.equal('"query.filter.o2start.to" must be greater than "ref:from"');

                    done();
                });
        });

        it('should return 400 if o2start  "to" date is before "from" date', (done) => {
            request(server)
                .get('/api/runs?filter[o2end][from]=946771200000&filter[o2end][to]=946684800000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    expect(errors[0].detail).to.equal('"query.filter.o2end.to" must be greater than "ref:from"');

                    done();
                });
        });

        it('should return 400 with 2 errors when from is after to and after now', (done) => {
            request(server)
                .get('/api/runs?filter[o2start][from]=1896130800000&filter[o2start][to]=1893452400000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    expect(errors.length).to.equal(2);
                    done();
                });
        });

        it('should return 400 if the duration filter is invalid', async () => {
            const response = await request(server).get('/api/runs?filter[runDuration][operator]=invalid&filter[runDuration][limit]=10');

            expect(response.status).to.equal(400);

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.runDuration.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on duration', async () => {
            const response =
                await request(server).get('/api/runs?filter[runDuration][operator]=>&filter[runDuration][limit]=0');

            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.be.an('array');

            expect(data).to.have.lengthOf(14);
        });

        it('should successfully filter on updatedAt', async () => {
            const lowerTimeLimit = new Date('2019-08-08 14:00:00').getTime();
            const upperTimeLimit = new Date('2022-03-22 15:00:00').getTime();
            const response =
                await request(server)
                    .get(`/api/runs?filter[updatedAt][from]=${lowerTimeLimit}&filter[updatedAt][to]=${upperTimeLimit}`);

            expect(response.status).to.equal(200);

            const { data } = response.body;

            expect(data).to.be.an('array');
            expect(data).to.have.lengthOf(10);
        });

        it('should return http status 400 if updatedAt from larger than to', async () => {
            const timeNow = Date.now();
            const response =
                await request(server)
                    .get(`/api/runs?filter[updatedAt][from]=${timeNow}&filter[updatedAt][to]=${timeNow}`);

            expect(response.status).to.equal(400);
            const { errors: [error] } = response.body;
            expect(error.detail).to.equal('"query.filter.updatedAt.to" must be greater than "ref:from"');
            expect(error.title).to.equal('Invalid Attribute');
        });

        it('should filter run on their quality', async () => {
            const response = await request(server)
                .get('/api/runs?filter[runQualities]=bad,test');
            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data.length).to.equal(44);
        });

        it('should filter run on their trigger value', async () => {
            const response = await request(server)
                .get('/api/runs?filter[triggerValues]=OFF,CTP');
            expect(response.status).to.equal(200);

            const { data } = response.body;

            expect(data.length).to.equal(20);
        });

        it('should filter runs on the odc topology value', async () => {
            const response = await request(server)
                .get('/api/runs?filter[odcTopologyFullName]=hash');
            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data.length).to.equal(7);
        });

        it('should return 400 if "runQuality" is invalid', async () => {
            const response = await request(server)
                .get('/api/runs?filter[runQualities]=invalid');
            expect(response.status).to.equal(400);

            const { errors } = response.body;
            expect(errors[0].detail).to.equal('"query.filter.runQualities[0]" must be one of [good, bad, test, none]');
        });

        it('should return 400 if the detectors number filter is invalid', async () => {
            const response =
                await request(server).get('/api/runs?filter[nDetectors][operator]=invalid&filter[nDetectors][limit]=3');

            expect(response.status).to.equal(400);

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.nDetectors.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on detectors number', async () => {
            const response =
                await request(server).get('/api/runs?filter[nDetectors][operator]=>=&filter[nDetectors][limit]=6');

            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.lengthOf(48);
        });

        it('should successfully filter on lhcPeriod', async () => {
            const response =
                await request(server).get('/api/runs?filter[lhcPeriods]=LHC22b');

            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.lengthOf.above(1);
        });

        it('should return 400 if the FLP number filter is invalid', async () => {
            const response = await request(server).get('/api/runs?filter[nFlps][operator]=invalid&filter[nFlps][limit]=10');

            expect(response.status).to.equal(400);

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.nFlps.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on FLPs number', async () => {
            const response =
                await request(server).get('/api/runs?filter[nFlps][operator]=<=&filter[nFlps][limit]=10');

            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.lengthOf(5);
        });

        it('should return 400 if the EPN number filter is invalid', async () => {
            const response = await request(server).get('/api/runs?filter[nEpns][operator]=invalid&filter[nEpns][limit]=10');

            expect(response.status).to.equal(400);

            const { errors: [error] } = response.body;
            expect(error.title).to.equal('Invalid Attribute');
            expect(error.detail).to.equal('"query.filter.nEpns.operator" must be one of [<, <=, =, >=, >]');
        });

        it('should successfully filter on EPNs number', async () => {
            const response =
                await request(server).get('/api/runs?filter[nEpns][operator]=<=&filter[nEpns][limit]=10');

            expect(response.status).to.equal(200);

            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.lengthOf(5);
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

    describe('GET /api/runs/:runNumber', () => {
        it('should return 400 if the run number is not a number', (done) => {
            request(server)
                .get('/api/runs/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be a number');

                    done();
                });
        });

        it('should return 400 if the run number is not positive', (done) => {
            request(server)
                .get('/api/runs/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the run number is not a whole number', (done) => {
            request(server)
                .get('/api/runs/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be an integer');

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

                    expect(res.body.errors[0].title).to.equal('Run with this run number (999999999) could not be found');

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

                    expect(res.body.data.runNumber).to.equal(1);

                    done();
                });
        });

        it('should return 200 and duration when there are trigger times', (done) => {
            request(server)
                .get('/api/runs/106')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.runDuration).to.equal(90000000);
                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.not.equal(null);
                    expect(data.timeTrgEnd).to.not.equal(null);
                    done();
                });
        });
        it('should return 200 and values \'0\' for 0 file size values', (done) => {
            request(server)
                .get('/api/runs/3')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.tfFileSize).to.equal('0');
                    expect(data.otherFileSize).to.equal('0');
                    expect(data.ctfFileSize).to.equal('0');
                    done();
                });
        });
        it('should return 200 whenever there is only a trigger start', (done) => {
            request(server)
                .get('/api/runs/104')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.equal(null);
                    expect(data.timeTrgEnd).to.not.equal(null);
                    done();
                });
        });

        it('should return 200 and a duration with no trigger end', (done) => {
            request(server)
                .get('/api/runs/103')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.runDuration).to.equal(3600000);
                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.not.equal(null);
                    expect(data.timeTrgEnd).to.equal(null);
                    done();
                });
        });
        it('should return 200 and a time when only o2 times are given', (done) => {
            request(server)
                .get('/api/runs/102')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.runDuration).to.equal(3600000);
                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.equal(null);
                    expect(data.timeTrgEnd).to.equal(null);

                    done();
                });
        });
    });

    describe('GET /api/runs/:runNumber/logs', () => {
        it('should return 400 if the run number is not a number', (done) => {
            request(server)
                .get('/api/runs/abc/logs')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be a number');

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

                    expect(res.body.errors[0].title).to.equal('Run with this run number (999999999) could not be found');

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

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(4);

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
            runNumber: 111,
            timeO2Start: '2022-03-21 13:00:00',
            timeTrgStart: '2022-03-21 13:00:00',
            environmentId: '2JIdys2N',
            runType: 'NONE',
            nDetectors: 3,
            nFlps: 10,
            nEpns: 10,
            dd_flp: true,
            dcs: true,
            epn: true,
            epnTopology: 'normal',
            detectors: 'CPV',
            odcTopologyFullName: 'synchronous-workflow',
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
                    expect(res.body.data.triggerValue).to.equal('OFF');
                    expect(res.body.data.odcTopologyFullName).to.equal('synchronous-workflow');
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.runType.id).to.be.a('number');
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
            expect(response.body.errors[0].detail).to.equal('A run already exists with run number 111');
        });
    });

    describe('PUT /api/runs/:runNumber', () => {
        it('should return 500 when run could not be found', (done) => {
            request(server)
                .put('/api/runs/9999999999')
                .send({
                    runQuality: RunQualities.BAD,
                })
                .expect(500)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors[0].detail).to.equal('Run with this run number (9999999999) could not be found');

                    done();
                });
        });
        it('should return 201 in all other cases', (done) => {
            request(server)
                .put('/api/runs/1')
                .send({
                    runQuality: RunQualities.BAD,
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data.runQuality).to.equal(RunQualities.BAD);
                    done();
                });
        });

        it('should successfully return the updated run entity with new runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/runs/1')
                .expect(201)
                .send({ runQuality: RunQualities.GOOD, runQualityChangeReason: 'Justification' });
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(1);
            expect(body.data.runQuality).to.equal(RunQualities.GOOD);
        });

        it('should return an error due to invalid runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/runs/1')
                .expect(400)
                .send({ runQuality: 'wrong', runQualityChangeReason: 'Justification' });
            expect(body.errors).to.be.an('array');
            expect(body.errors[0].detail).to.equal('"body.runQuality" must be one of [good, bad, test, none]');
        });

        it('should return 500 when trying to update the run quality without justification', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/1')
                .send({ runQuality: RunQualities.BAD });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Run quality change require a reason');
        });

        it('should return 500 when trying to update the run quality with an empty justification', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/1')
                .send({ runQuality: RunQualities.BAD });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Run quality change require a reason');
        });

        it('should successfully return the updated run entity with new runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/runs/106')
                .expect(201)
                .send({ runQuality: RunQualities.GOOD });
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(106);
            expect(body.data.runQuality).to.equal(RunQualities.GOOD);
        });

        it('should successfully add eorReasons to run and check runQuality did not change', async () => {
            const currentRun = await request(server)
                .get('/api/runs/106')
                .expect(200);
            expect(currentRun.body.data).to.be.an('object');
            expect(currentRun.body.data.runNumber).to.equal(106);
            expect(currentRun.body.data.runQuality).to.equal(RunQualities.GOOD);
            expect(currentRun.body.data.eorReasons).to.have.lengthOf(0);

            const { body } = await request(server)
                .put('/api/runs/106')
                .expect(201)
                .send({
                    eorReasons: [
                        {
                            reasonTypeId: 1,
                            description: 'Some',
                        },
                    ],
                });
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(106);
            expect(body.data.eorReasons).to.have.lengthOf(1);
            expect(body.data.eorReasons[0].description).to.equal('Some');
            expect(body.data.runQuality).to.equal(RunQualities.GOOD);
        });

        it('should give a proper error when a detectorId does not exists', async () => {
            const { body } = await request(server)
                .put('/api/runs/1')
                .expect(500)
                .send({
                    detectorsQualities: [
                        {
                            detectorId: 1,
                            quality: RunDetectorQualities.BAD,
                        },
                        {
                            detectorId: 32,
                            quality: RunDetectorQualities.BAD,
                        },
                    ],
                    detectorsQualitiesChangeReason: 'Justification',
                });
            expect(body.errors[0].detail).to.equal('This run\'s detector with runNumber: (1) and with detector Id: (32) could not be found');
        });

        it('should successfully return the updated run entity with new detector\'s run quality', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/1')
                .send({
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: 'Justification',
                });
            expect(status).to.equal(201);
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(1);
            expect(body.data.detectorsQualities).to.lengthOf(1);
            expect(body.data.detectorsQualities[0].id).to.equal(1);
            expect(body.data.detectorsQualities[0].quality).to.equal(RunDetectorQualities.GOOD);
        });

        it('should return 500 when trying to update the detector\'s quality of a run that has not ended yet', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/105')
                .send({
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: 'Justification',
                });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Detector quality can not be updated on a run that has not ended yet');
        });

        it('should return 500 when trying to update the detector\'s quality without justification', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/1')
                .send({ detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }] });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Detector quality change reason is required when updating detector quality');
        });

        it('should return 500 when trying to update the detector\'s quality with an empty justification', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/1')
                .send({ detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }], detectorsQualitiesChangeReason: '     ' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Detector quality change reason is required when updating detector quality');
        });

        it('should successfully allow to update calibration status for calibration run', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS });
            expect(status).to.equal(201);
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(40);
            expect(body.data.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);
        });

        it('should successfully return 500 when trying to set calibration status for non-calibration run', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/106')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Calibration status is reserved to calibration runs');
        });

        it('should successfully return 500 when trying to set calibration status change reason for non-failed calibration', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.NO_STATUS, calibrationStatusChangeReason: 'A spurious reason' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change reason can only be specified when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status to FAILED without reason', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.FAILED });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status to FAILED with an empty', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.FAILED, calibrationStatusChangeReason: '      ' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status from FAILED without reason', async () => {
            await updateRun(
                { runNumber: 40 },
                { runPatch: { calibrationStatus: RunCalibrationStatus.FAILED }, metadata: { calibrationStatusChangeReason: 'A reason' } },
            );
            const { body, status } = await request(server)
                .put('/api/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status from FAILED with an empty reason', async () => {
            const { body, status } = await request(server)
                .put('/api/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS, calibrationStatusChangeReason: '    ' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });
    });

    describe('PATCH api/runs query:runNumber', () => {
        it('should return 500 if the wrong id is given', (done) => {
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
                    expect(res.body.errors[0].title).to.equal('ServiceUnavailable');

                    done();
                });
        });
        it('should return 200 in all other cases', (done) => {
            const TIMESTAMP = 1664271988000;
            const BIG_INT_NUMBER = '99999999999999999';
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
                    startOfDataTransfer: TIMESTAMP,
                    endOfDataTransfer: TIMESTAMP,
                    ctfFileCount: 30,
                    ctfFileSize: BIG_INT_NUMBER,
                    tfFileCount: 1234,
                    tfFileSize: BIG_INT_NUMBER,
                    otherFileCount: 123156132,
                    otherFileSize: BIG_INT_NUMBER,
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;
                    expect(data.runNumber).to.equal(1);
                    expect(data.lhcBeamEnergy).to.equal(232.156);
                    expect(data.lhcBeamMode).to.equal('STABLE BEAMS');
                    expect(data.lhcBetaStar).to.equal(123e-5);
                    expect(data.aliceL3Current).to.equal(561.2);
                    expect(data.aliceL3Polarity).to.equal('POSITIVE');
                    expect(data.aliceDipoleCurrent).to.equal(45654.1);
                    expect(data.aliceDipolePolarity).to.equal('NEGATIVE');
                    expect(data.startOfDataTransfer).to.equal(TIMESTAMP);
                    expect(data.endOfDataTransfer).to.equal(TIMESTAMP);
                    expect(data.ctfFileCount).to.equal(30);
                    expect(data.ctfFileSize).to.equal(BIG_INT_NUMBER);
                    expect(data.tfFileCount).to.equal(1234);
                    expect(data.tfFileSize).to.equal(BIG_INT_NUMBER);
                    expect(data.otherFileCount).to.equal(123156132);
                    expect(data.otherFileSize).to.equal(BIG_INT_NUMBER);
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
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors[0].title).to.equal('Run with this run number (9999999999) could not be found');

                    done();
                });
        });
        it('should successfully update a run by its RunNumber with partial information', (done) => {
            request(server)
                .patch('/api/runs/1')
                .send({
                    timeO2End: dateValue,
                    timeTrgEnd: dateValue,
                    lhcPeriod: 'LHC22b',
                    odcTopologyFullName: 'hash',
                    pdpWorkflowParameters: 'EVENT_DISPLAY',
                    pdpBeamType: 'fill',
                    readoutCfgUri: 'hash',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.id).to.equal(1);
                    expect(res.body.data.timeO2End).to.equal(dateValue);
                    expect(res.body.data.timeTrgEnd).to.equal(dateValue);
                    expect(res.body.data.lhcPeriod).to.equal('LHC22b');
                    expect(res.body.data.odcTopologyFullName).to.equal('hash');
                    expect(res.body.data.pdpWorkflowParameters).to.equal('EVENT_DISPLAY');
                    expect(res.body.data.pdpBeamType).to.equal('fill');
                    expect(res.body.data.readoutCfgUri).to.equal('hash');
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
                    pdpTopologyDescriptionLibraryFile: 'production/production.desc',
                    tfbDdMode: 'processing',
                    lhcPeriod: 'LHC22b',
                    triggerValue: 'LTU',
                    odcTopologyFullName: 'default',
                });
            expect(body.data).to.be.an('object');
            expect(body.data.timeO2End).to.equal(dateValue); // Values not passed should remain the same
            expect(body.data.timeO2Start).to.equal(dateValue); // Values not passed should remain the same
            expect(body.data.pdpConfigOption).to.equal('Repository hash');
            expect(body.data.pdpTopologyDescriptionLibraryFile).to.equal('production/production.desc');
            expect(body.data.tfbDdMode).to.equal('processing');
            expect(body.data.lhcPeriod).to.equal('LHC22b');
            expect(body.data.triggerValue).to.equal('LTU');
            expect(body.data.odcTopologyFullName).to.equal('default');
        });
    });
};
