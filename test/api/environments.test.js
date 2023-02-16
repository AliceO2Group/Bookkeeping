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

module.exports = () => {
    before(resetDatabaseContent);
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

                    expect(res.body.data).to.be.an('array');

                    done();
                });
        });
    });
    describe('POST /api/environments', () => {
        it('should return 201 if valid data is provided', (done) => {
            request(server)
                .post('/api/environments')
                .expect(201)
                .send({
                    envId: 'New original env',
                    status: 'STANDBY',
                    statusMessage: 'This is going very good',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data.id).to.equal('New original env');
                    expect(data.status).to.equal('STANDBY');
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
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

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
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    done();
                });
        });
        it('should return 201 if valid data is given', (done) => {
            request(server)
                .put('/api/environments/KGIS12DS')
                .send({
                    toredownAt: toredownDate,
                    status: 'DESTROYED',
                    statusMessage: 'This is a good environment.',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data.status).to.equal('DESTROYED');
                    expect(res.body.data.toredownAt).to.equal(toredownDate);
                    expect(res.body.data.statusMessage).to.equal('This is a good environment.');
                    done();
                });
        });
    });
};
