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
    beamType: 'XeXe',
    avgCenterOfMassEnergy: 1264.9836246503144,
    distinctEnergies: [55.2],
    lhcPeriod: {
        id: 2,
        name: 'LHC22b',
    },
    runsCount: 1,
    dataPassesCount: 2,
};

const lhcPeriod_LHC22a = {
    id: 1,
    beamType: 'PbPb,pp',
    avgCenterOfMassEnergy: 99.52079923444215,
    distinctEnergies: [
        23.21,
        56.1,
    ],
    lhcPeriod: {
        id: 1,
        name: 'LHC22a',
    },
    runsCount: 3,
    dataPassesCount: 1,

};

const lhcPeriod_LHC23f = {
    id: 3,
    beamType: null,
    avgCenterOfMassEnergy: null,
    distinctEnergies: [],
    lhcPeriod: {
        id: 3,
        name: 'LHC23f',
    },
    dataPassesCount: 0,
    runsCount: 0,
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/lhcPeriodsStatistics', () => {
        it('should successfuly fetch all data', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data, meta } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 3, pageCount: 1 } });
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(3);

                    done();
                });
        });
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?filter[ids][]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data, meta } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 1, pageCount: 1 } });
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC22a);

                    done();
                });
        });
        it('should successfuly filter on names', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?filter[names][]=LHC22b')
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
                .get('/api/lhcPeriodsStatistics?filter[ids][]=9999')
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
                .get('/api/lhcPeriodsStatistics?filter[names][]=LHC29xyz')
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
                .get('/api/lhcPeriodsStatistics?filter[ids][]=1&filter[ids][]=2')
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
        it('should succefully filter on years', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?filter[years][]=2023')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(lhcPeriod_LHC23f);
                    done();
                });
        });
        it('should succefully filter on beamTypes', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?filter[beamTypes][]=XeXe')
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
                .get('/api/lhcPeriodsStatistics?sort[id]=DESC&sort[name]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: lhcPeriods } = res.body;
                    expect(lhcPeriods).to.be.an('array');
                    expect(lhcPeriods).to.be.lengthOf(3);
                    expect(lhcPeriods).to.have.ordered.deep.members([
                        lhcPeriod_LHC23f,
                        lhcPeriod_LHC22b,
                        lhcPeriod_LHC22a,
                    ]);

                    done();
                });
        });
        it('should successfuly sort on year', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?sort[year]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: lhcPeriods } = res.body;
                    expect(lhcPeriods).to.be.an('array');
                    expect(lhcPeriods).to.be.lengthOf(3);
                    expect(lhcPeriods[0]).to.be.eql(lhcPeriod_LHC23f);
                    expect(lhcPeriods.slice(1)).to.have.deep.members([lhcPeriod_LHC22a, lhcPeriod_LHC22b]);

                    done();
                });
        });
        it('should successfuly sort on beamType', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?sort[beamType]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: lhcPeriods } = res.body;
                    expect(lhcPeriods).to.be.an('array');
                    expect(lhcPeriods).to.be.lengthOf(3);
                    expect(lhcPeriods).to.have.deep.ordered.members([lhcPeriod_LHC22b, lhcPeriod_LHC22a, lhcPeriod_LHC23f]);
                    done();
                });
        });
        it('should support pagination', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?page[offset]=1&sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: lhcPeriods } = res.body;
                    expect(lhcPeriods).to.be.an('array');
                    expect(lhcPeriods).to.have.ordered.deep.members([
                        lhcPeriod_LHC22b,
                        lhcPeriod_LHC22a,
                    ]);

                    done();
                });
        });
        it('should return 400 when bad query paramter provided', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics?a=1')
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
                .get('/api/lhcPeriodsStatistics?page[limit]=0')
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
                .get('/api/lhcPeriodsStatistics?page[limit]=0')
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

    describe('GET /api/lhcPeriodsStatistics/:lhcPeriodId', () => {
        it('should successfuly fetch period with given id 1', (done) => {
            request(server)
                .get('/api/lhcPeriodsStatistics/1')
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
                .get('/api/lhcPeriodsStatistics/2')
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
                .get('/api/lhcPeriodsStatistics/9999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Not found');
                    expect(res.body.errors[0].detail).to.equal('LHC Period with this id (9999) could not be found');
                    done();
                });
        });
    });
};
