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

const LHC23k6c = {
    id: 1,
    name: 'LHC23k6c',
    jiraId: 'SIMTICKET-1',
    description: 'Some Random general purpose for LHC23k6c',
    pwg: 'PWGX2',
    requestedEventsCount: 1345555,
    generatedEventsCount: 4316450,
    outputSize: 14013600611699,
};

const LHC23k6b = {
    id: 2,
    name: 'LHC23k6b',
    jiraId: 'SIMTICKET-2',
    description: 'Some Random general purpose for LHC23k6b',
    pwg: 'PWGX1',
    requestedEventsCount: 2345555,
    generatedEventsCount: 54800,
    outputSize: 157000310748,
};

const LHC23k6a = {
    id: 3,
    name: 'LHC23k6a',
    jiraId: 'SIMTICKET-3',
    description: 'Some Random general purpose for LHC23k6a',
    pwg: 'PWGX3',
    requestedEventsCount: 2245555,
    generatedEventsCount: 53800,
    outputSize: 147000310748,
};

module.exports = () => {
    before(resetDatabaseContent);
    describe('GET /api/simulationPasses/:id', () => {
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/simulationPasses/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.eql(LHC23k6c);

                    done();
                });
        });
    });

    describe('GET /api/simulationPasses/:id', () => {
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/simulationPasses/99999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    expect(errors).to.be.eql([
                        {
                            status: 404,
                            title: 'Not found',
                            detail: 'Simulation Pass with this id (99999) could not be found',
                        },
                    ]);

                    done();
                });
        });
    });

    describe('GET /api/simulationPasses', () => {
        it('should successfuly fetch all data', (done) => {
            request(server)
                .get('/api/simulationPasses')
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
                    expect(data).to.have.all.deep.members([LHC23k6a, LHC23k6b, LHC23k6c]);
                    done();
                });
        });
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/simulationPasses?filter[ids][]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data, meta } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 1, pageCount: 1 } });
                    expect(data).to.be.an('array');
                    expect(data).to.have.all.deep.members([LHC23k6c]);

                    done();
                });
        });
        it('should successfuly filter on names', (done) => {
            request(server)
                .get('/api/simulationPasses?filter[names][]=LHC23k6b')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.have.all.deep.members([LHC23k6b]);

                    done();
                });
        });
        it('should retrive no records when filtering on ids', (done) => {
            request(server)
                .get('/api/simulationPasses?filter[ids][]=9999')
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
                .get('/api/simulationPasses?filter[names][]=LHC2asdfasdf2b_aasdfpass2asdf')
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
                .get('/api/simulationPasses?filter[ids][]=1&filter[ids][]=2')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.have.all.deep.members([LHC23k6c, LHC23k6b]);
                    done();
                });
        });
        it('should succefully filter on lhcPeriodIds', (done) => {
            request(server)
                .get('/api/simulationPasses?filter[lhcPeriodIds][]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.members([LHC23k6b, LHC23k6a]);
                    done();
                });
        });
        it('should succefully filter on dataPassIds', (done) => {
            request(server)
                .get('/api/simulationPasses?filter[dataPassIds][]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.members([LHC23k6c]);
                    done();
                });
        });
        it('should successfuly sort on id and name', (done) => {
            request(server)
                .get('/api/simulationPasses?sort[id]=DESC&sort[name]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.ordered.deep.members([LHC23k6a, LHC23k6b, LHC23k6c]);

                    done();
                });
        });
        it('should successfuly sort on outputSize', (done) => {
            request(server)
                .get('/api/simulationPasses?sort[outputSize]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.ordered.members([LHC23k6c, LHC23k6b, LHC23k6a]);
                    done();
                });
        });
        it('should successfuly sort on requestedEventsCount', (done) => {
            request(server)
                .get('/api/simulationPasses?sort[requestedEventsCount]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.ordered.members([LHC23k6b, LHC23k6a, LHC23k6c]);
                    done();
                });
        });
        it('should successfuly sort on generatedEventsCount', (done) => {
            request(server)
                .get('/api/simulationPasses?sort[generatedEventsCount]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.ordered.members([LHC23k6c, LHC23k6b, LHC23k6a]);
                    done();
                });
        });
        it('should successfuly sort on pwg', (done) => {
            request(server)
                .get('/api/simulationPasses?sort[pwg]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.ordered.members([LHC23k6a, LHC23k6c, LHC23k6b]);
                    done();
                });
        });
        it('should successfuly sort on jiraId', (done) => {
            request(server)
                .get('/api/simulationPasses?sort[jiraId]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.deep.ordered.members([LHC23k6a, LHC23k6b, LHC23k6c]);
                    done();
                });
        });
        it('should support pagination', (done) => {
            request(server)
                .get('/api/simulationPasses?page[offset]=1&sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: simulationPasses } = res.body;
                    expect(simulationPasses).to.be.an('array');
                    expect(simulationPasses).to.have.ordered.deep.members([LHC23k6b, LHC23k6c]);

                    done();
                });
        });
        it('should return 400 when bad query paramter provided', (done) => {
            request(server)
                .get('/api/simulationPasses?a=1')
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
                .get('/api/simulationPasses?page[limit]=0')
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
};
