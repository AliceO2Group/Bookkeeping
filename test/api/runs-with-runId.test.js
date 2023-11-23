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
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/legacy/runs/:runId', () => {
        it('should return 400 if the run id is not a number', (done) => {
            request(server)
                .get('/api/legacy/runs/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be a number');

                    done();
                });
        });

        it('should return 400 if the run id is not positive', (done) => {
            request(server)
                .get('/api/legacy/runs/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the run id is not a whole number', (done) => {
            request(server)
                .get('/api/legacy/runs/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runId');
                    expect(titleError.detail).to.equal('"params.runId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the run could not be found', (done) => {
            request(server)
                .get('/api/legacy/runs/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Run with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/legacy/runs/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.id).to.equal(1);

                    done();
                });
        });

        it('should return 200 and duration when there are trigger times', (done) => {
            request(server)
                .get('/api/legacy/runs/106')
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
                .get('/api/legacy/runs/3')
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
                .get('/api/legacy/runs/104')
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
                .get('/api/legacy/runs/103')
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
                .get('/api/legacy/runs/102')
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
};
