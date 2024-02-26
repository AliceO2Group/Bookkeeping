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
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { server } = require('../../lib/application');
const { buildUrl } = require('../../lib/utilities/buildUrl.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/lhcFills', () => {
        it('should return 200 and an array for a normal request', (done) => {
            request(server)
                .get('/api/lhcFills')
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
    });
    describe('POST /api/lhcFills', () => {
        it('should return 201 if valid data is provided', (done) => {
            request(server)
                .post('/api/lhcFills')
                .expect(201)
                .send({
                    fillNumber: 544455,
                    stableBeamsStart: new Date('2022-03-22 15:00:00'),
                    stableBeamsEnd: new Date('2022-03-22 15:00:00'),
                    stableBeamsDuration: 600,
                    beamType: 'Pb-Pb',
                    fillingSchemeName: 'schemename',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;
                    expect(data.stableBeamsStart).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
                    expect(data.stableBeamsEnd).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
                    expect(data.stableBeamsDuration).to.equal(600);
                    expect(data.beamType).to.equal('Pb-Pb');
                    expect(data.fillingSchemeName).to.equal('schemename');
                    done();
                });
        });
        it('should return 409 if the fillNumber is duplicate', (done) => {
            request(server)
                .post('/api/lhcFills')
                .expect(409)
                .send({
                    fillNumber: 1,
                    stableBeamsStart: new Date('2022-03-22 15:00:00'),
                    stableBeamsEnd: new Date('2022-03-22 15:00:00'),
                    stableBeamsDuration: 600,
                    beamType: 'Pb-Pb',
                    fillingSchemeName: 'schemename',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors[0].detail).to.equal('The provided fillNumber already exists');

                    done();
                });
        });
    });
    describe('PATCH /api/lhcFills/:fillNumber', () => {
        it('should return 400 if the wrong id is provided', (done) => {
            request(server)
                .patch('/api/lhcFills/99999')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors[0].title).to.equal(`LhcFill with this id (${99999}) could not be found`);

                    done();
                });
        });
        it('should return 201 if valid data is given', (done) => {
            request(server)
                .patch('/api/lhcFills/1')
                .send({
                    stableBeamsStart: new Date('2022-03-22 15:00:00'),
                    stableBeamsEnd: new Date('2022-03-22 15:00:00'),
                    stableBeamsDuration: 600,
                    beamType: 'Pb-Pb',
                    fillingSchemeName: 'schemename',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;
                    expect(data.stableBeamsStart).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
                    expect(data.stableBeamsEnd).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
                    expect(data.stableBeamsDuration).to.equal(600);
                    expect(data.beamType).to.equal('Pb-Pb');
                    expect(data.fillingSchemeName).to.equal('schemename');
                    done();
                });
        });
    });

    describe('GET /api/lhcFills/:fillNumber/runs/:runNumber', () => {
        it('should return 200 and an array for a normal request', (done) => {
            request(server)
                .get('/api/lhcFills/1/runs/50')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data.runNumber).to.equal(50);
                    done();
                });
        });

        it('should return 404 when a invalid run number is given', (done) => {
            request(server)
                .get('/api/lhcFills/1/runs/2')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal(`The lhcFill (${1}) does not contain the run with run number (${2})`);
                    done();
                });
        });
    });
    describe('GET /api/lhcFills/:fillNumber', () => {
        it('should return 200 and an array for a normal request', (done) => {
            request(server)
                .get('/api/lhcFills/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data.stableBeamsStart).to.equal(1647961200000);
                    expect(data.stableBeamsEnd).to.equal(1647961200000);
                    expect(data.stableBeamsDuration).to.equal(600);
                    expect(data.beamType).to.equal('Pb-Pb');
                    expect(data.fillingSchemeName).to.equal('schemename');
                    expect(data.fillNumber).to.equal(1);
                    done();
                });
        });

        it('should return 404 when a invalid run number is given', (done) => {
            request(server)
                .get('/api/lhcFills/99999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('LhcFill with this id (99999) could not be found');
                    done();
                });
        });
    });
    describe('GET /api/lhcFills/:fillNumber/runs', () => {
        it('should return 200 and an array for a normal request', (done) => {
            request(server)
                .get('/api/lhcFills/1/runs')
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
    });

    describe('GET /api/lhcFills/:lhcFillNumber/logs/', () => {
        it('should succesfully return a 200 response containing the logs linked to a given LHC fill', async () => {
            const response = await request(server).get('/api/lhcFills/6/logs');
            expect(response.status).to.equal(200);
            expect(response.body.data).to.lengthOf(2);
        });
    });

    describe('GET /api/lhcFills/:fillNumber/runs/:runNumber', () => {
        it('should successfully return a 200 response containing the fills that are ended in the given period', async () => {
            const firstCreatedAt = new Date('2019-08-09 18:00:00');
            const secondCreatedAt = new Date('2019-08-09 20:00:00');
            const url = buildUrl('/api/lhcFills/ended-within', {
                from: firstCreatedAt.getTime(),
                to: secondCreatedAt.getTime(),
            });
            const response = await request(server).get(url);
            expect(response.status).to.equal(200);
            expect(response.body.data).to.lengthOf(2);
            expect(response.body.data.map(({ fillNumber }) => fillNumber)).to.have.members([2, 3]);
        });

        it('should successfully return 400 if the given limits are not valid', async () => {
            const createdAt = new Date('2019-08-09 20:00:00').getTime();

            const baseUrl = '/api/lhcFills/ended-within';

            {
                const response = await request(server).get(baseUrl);
                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.from" is required');
            }

            {
                const url = buildUrl(baseUrl, { from: createdAt });
                const response = await request(server).get(url);
                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.to" is required');
            }

            {
                const url = buildUrl(baseUrl, { to: createdAt });
                const response = await request(server).get(url);
                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.from" is required');
            }

            {
                const url = buildUrl(baseUrl, {
                    from: 'from',
                });
                const response = await request(server).get(url);
                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.from" must be a valid date');
            }

            {
                const url = buildUrl(baseUrl, {
                    from: createdAt, // Put a valid date to check the to error
                    to: 'to',
                });
                const response = await request(server).get(url);
                expect(response.status).to.equal(400);

                const { errors: [error] } = response.body;
                expect(error.title).to.equal('Invalid Attribute');
                expect(error.detail).to.equal('"query.to" must be a valid date');
            }
        });
    });
};
