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

const lhcPeriod_LHC22b = {
    id: 2,
    name: 'LHC22b',
    lhcPeriodStatistics: {
        id: 2,
        avgEnergy: null,
    },
};

const lhcPeriod_LHC22a = {
    id: 1,
    name: 'LHC22a',
    lhcPeriodStatistics: {
        id: 1,
        avgEnergy: 23.209999084472656,
    },
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/lhcPeriods', () => {
        it('should successfuly fetch all data', (done) => {
            request(server)
                .get('/api/lhcPeriods')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(2);

                    done();
                });
        });
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[ids]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC22a);

                    done();
                });
        });
        it('should successfuly filter on names', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[names]=LHC22b')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC22b);

                    done();
                });
        });
        it('should retrive no records when filtering on ids', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[ids]=9999')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(0);

                    done();
                });
        });
        it('should retrive no records when filtering on names', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[names]=LHC29xyz')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(0);
                    done();
                });
        });
        it('should succefully filter on ids given as array', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[ids][]=1&filter[ids][]=2')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(2);
                    done();
                });
        });
        it('should succefully filter on names given as array', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[names][]=LHC22b')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC22b);
                    done();
                });
        });
        it('should successfuly sort on id and name', (done) => {
            request(server)
                .get('/api/lhcPeriods?sort[id]=DESC&sort[name]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(2);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC22b);
                    expect(data[1]).to.be.eql(lhcPeriod_LHC22a);

                    done();
                });
        });
        it('should support pagination', (done) => {
            request(server)
                .get('/api/lhcPeriods?page[offset]=1&sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC22a);

                    done();
                });
        });
        it('should return 400 when bad query paramter provided', (done) => {
            request(server)
                .get('/api/lhcPeriods?a=1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/a');
                    expect(titleError.detail).to.equal('"query.a" is not allowed');
                    done();
                });
        });
        it('should return 400 if the limit is below 1', (done) => {
            request(server)
                .get('/api/lhcPeriods?page[limit]=0')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
                    expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
                    done();
                });
        });
        it('should return 400 if the limit is below 1', (done) => {
            request(server)
                .get('/api/lhcPeriods?page[limit]=0')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
                    expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
                    done();
                });
        });
    });

    describe('GET /api/lhcPeriods/:lhcPeriodId', () => {
        it('should successfuly fetch period with given id 1', (done) => {
            request(server)
                .get('/api/lhcPeriods/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.eql(lhcPeriod_LHC22a);
                    done();
                });
        });

        it('should successfuly fetch period with given id 2', (done) => {
            request(server)
                .get('/api/lhcPeriods/2')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.eql(lhcPeriod_LHC22b);
                    done();
                });
        });

        it('should return 404 if lhc period could not be found', (done) => {
            request(server)
                .get('/api/lhcPeriods/9999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Lhc Period with this id (9999) could not be found');
                    done();
                });
        });
    });
};
