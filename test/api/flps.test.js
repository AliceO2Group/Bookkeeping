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
const { repositories: { FlpRoleRepository } } = require('../../lib/database');

const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/flps', () => {
        it('should return an array', (done) => {
            request(server)
                .get('/api/flps')
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
                .get('/api/flps?page[offset]=0&page[limit]=1&sort[id]=asc')
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
                .get('/api/flps?page[offset]=1&page[limit]=1&sort[id]=asc')
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

        it('should return 400 if the limit is below 1', (done) => {
            request(server)
                .get('/api/flps?page[offset]=0&page[limit]=0')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
                    expect(titleError.detail).to.equal('"query.page.limit" must be larger than or equal to 1');

                    done();
                });
        });

        it('should return the correct number of pages', (done) => {
            request(server)
                .get('/api/flps?page[offset]=0&page[limit]=2')
                .expect(200)
                .end(async (err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const totalNumber = await FlpRoleRepository.count();

                    expect(res.body.data).to.have.lengthOf(2);
                    expect(res.body.meta.page.pageCount).to.equal(Math.ceil(totalNumber / 2));
                    expect(res.body.meta.page.totalCount).to.equal(totalNumber);

                    done();
                });
        });

        it('should support sorting, name DESC', (done) => {
            request(server)
                .get('/api/flps?sort[name]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data[0].name).to.be.greaterThan(data[1].name);

                    done();
                });
        });

        it('should support sorting, name ASC', (done) => {
            request(server)
                .get('/api/flps?sort[name]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data[1].name).to.be.greaterThan(data[0].name);

                    done();
                });
        });
    });

    describe('GET /api/flps/:flpId', () => {
        it('should return 400 if the flp id is not a number', (done) => {
            request(server)
                .get('/api/flps/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/flpId');
                    expect(titleError.detail).to.equal('"params.flpId" must be a number');

                    done();
                });
        });

        it('should return 400 if the flp id is not positive', (done) => {
            request(server)
                .get('/api/flps/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/flpId');
                    expect(titleError.detail).to.equal('"params.flpId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the flp id is not a whole number', (done) => {
            request(server)
                .get('/api/flps/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/flpId');
                    expect(titleError.detail).to.equal('"params.flpId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the flp could not be found', (done) => {
            request(server)
                .get('/api/flps/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Flp with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/flps/1')
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
    });

    describe('GET /api/flps/:flpId/logs', () => {
        it('should return 400 if the flp id is not a number', (done) => {
            request(server)
                .get('/api/flps/abc/logs')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/flpId');
                    expect(titleError.detail).to.equal('"params.flpId" must be a number');

                    done();
                });
        });

        it('should return 404 if the flp could not be found', (done) => {
            request(server)
                .get('/api/flps/999999999/logs')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Flp with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/flps/1/logs')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(4);

                    expect(res.body.data[0].id).to.equal(1);
                    expect(res.body.data[0].flps).to.deep.equal([
                        {
                            id: 1,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('POST api/flps', () => {
        it('should return 400 if no name or hostname is provided', (done) => {
            request(server)
                .post('/api/flps')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const nameError = errors.find((err) => err.source.pointer === '/data/attributes/body/name');
                    expect(nameError.detail).to.equal('"body.name" is required');

                    const hostnameError = errors.find((err) => err.source.pointer === '/data/attributes/body/hostname');
                    expect(hostnameError.detail).to.equal('"body.hostname" is required');

                    done();
                });
        });

        it('should return 201 if a proper body was sent', (done) => {
            request(server)
                .post('/api/flps')
                .send({
                    name: 'FLPIEE',
                    hostname: 'www.home.cern',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.name).to.equal('FLPIEE');
                    expect(res.body.data.hostname).to.equal('www.home.cern');

                    done();
                });
        });
    });
};
