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
const { repositories: { LogRepository } } = require('../../lib/database');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const { server } = require('../../lib/application');

    describe('GET /api/logs', () => {
        it('should return an array', (done) => {
            request(server)
                .get('/api/logs')
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

        it('should support filtering by tag', (done) => {
            request(server)
                .get('/api/logs?filter[tag][values]=2,5&filter[tag][operation]=and')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length > 0).to.be.true;
                    for (const log of res.body.data) {
                        let found = false;
                        for (const tag of log.tags) {
                            if (found) {
                                continue;
                            }
                            found = tag.id === 2 || tag.id === 5;
                        }
                        expect(found).to.be.true;
                    }

                    done();
                });
        });

        it('should support filtering by tag', (done) => {
            request(server)
                .get('/api/logs?filter[tag][values]=1,2,3,4,5,6&filter[tag][operation]=and')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length > 0).to.be.false;
                    done();
                });
        });

        it('should support filtering by tag', (done) => {
            request(server)
                .get('/api/logs?filter[tag][values]=1,2&filter[tag][operation]=or')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length > 0).to.be.true;
                    for (const log of res.body.data) {
                        let found = false;
                        for (const tag of log.tags) {
                            if (found) {
                                continue;
                            }
                            found = tag.id === 1 || tag.id === 2;
                        }
                        expect(found).to.be.true;
                    }

                    done();
                });
        });

        it('should support filtering by parent log', (done) => {
            request(server)
                .get('/api/logs?filter[parentLog]=2')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(2);

                    done();
                });
        });

        it('should return 400 for an invalid parent log', (done) => {
            request(server)
                .get('/api/logs?filter[parentLog]=-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail).to.equal('"query.filter.parentLog" must be a positive number');

                    done();
                });
        });

        it('should support filtering by root log', (done) => {
            request(server)
                .get('/api/logs?filter[rootLog]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(4);

                    done();
                });
        });

        it('should return 400 for an invalid root log', (done) => {
            request(server)
                .get('/api/logs?filter[rootLog]=-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail).to.equal('"query.filter.rootLog" must be a positive number');

                    done();
                });
        });

        it('should support filtering by origin (process)', (done) => {
            request(server)
                .get('/api/logs?filter[origin]=process')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    for (const log of res.body.data) {
                        expect(log.origin).to.equal('process');
                    }

                    done();
                });
        });

        it('should support filtering by origin (human)', (done) => {
            request(server)
                .get('/api/logs?filter[origin]=human')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    for (const log of res.body.data) {
                        expect(log.origin).to.equal('human');
                    }

                    done();
                });
        });

        it('should return 400 for an unknown origin filter', (done) => {
            request(server)
                .get('/api/logs?filter[origin]=_')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const [titleError] = res.body.errors;
                    expect(titleError.detail).to.equal('"query.filter.origin" must be one of [human, process]');

                    done();
                });
        });

        it('should support pagination, offset 0 and limit 1', (done) => {
            request(server)
                .get('/api/logs?page[offset]=0&page[limit]=1&sort[id]=asc')
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
                .get('/api/logs?page[offset]=1&page[limit]=1&sort[id]=asc')
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
                .get('/api/logs?page[offset]=0&page[limit]=0')
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
                    expect(titleError.detail).to.equal('"query.page.limit" must be larger than or equal to 1');

                    done();
                });
        });

        it('should return the correct number of pages', (done) => {
            request(server)
                .get('/api/logs?page[offset]=0&page[limit]=2')
                .expect(200)
                .end(async (err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const totalNumber = await LogRepository.count();

                    expect(res.body.data).to.have.lengthOf(2);
                    expect(res.body.meta.page.pageCount).to.equal(Math.ceil(totalNumber / 2));
                    expect(res.body.meta.page.totalCount).to.equal(totalNumber);

                    done();
                });
        });

        it('should support sorting, id DESC', (done) => {
            request(server)
                .get('/api/logs?sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect(data[0].id).to.be.greaterThan(data[1].id);

                    done();
                });
        });

        it('should support sorting, id ASC', (done) => {
            request(server)
                .get('/api/logs?sort[id]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect(data[1].id).to.be.greaterThan(data[0].id);

                    done();
                });
        });
    });

    describe('POST /api/logs', () => {
        it('should return 400 if no title is provided', (done) => {
            request(server)
                .post('/api/logs')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/title');
                    expect(titleError.detail).to.equal('"body.title" is required');

                    done();
                });
        });

        it('should return 400 if the title is too short', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'A',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/title');
                    expect(titleError.detail).to.equal('"body.title" length must be at least 3 characters long');

                    done();
                });
        });

        it('should return 400 if the title is too long', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: `
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    `,
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/title');
                    expect(titleError.detail)
                        .to.equal('"body.title" length must be less than or equal to 140 characters long');

                    done();
                });
        });

        it('should return 400 if no text is provided', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const textError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(textError.detail).to.equal('"body.text" is required');

                    done();
                });
        });

        it('should return 400 if the text is too short', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'A',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const textError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(textError.detail).to.equal('"body.text" length must be at least 3 characters long');

                    done();
                });
        });

        it('should return 400 if an unknown parent log was provided', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'Text of yet another run',
                    parentLogId: 999,
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Parent log with this id (999) could not be found');

                    done();
                });
        });

        it('should return 201 if a proper body was sent', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'Text of yet another run',
                    parentLogId: 2,
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.title).to.equal('Yet another run');
                    expect(res.body.data.rootLogId).to.equal(1);
                    expect(res.body.data.parentLogId).to.equal(2);

                    done();
                });
        });

        it('should return 201 if a proper body was sent', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'Text of yet another run',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.title).to.equal('Yet another run');
                    expect(res.body.data.rootLogId).to.equal(res.body.data.id);
                    expect(res.body.data.parentLogId).to.equal(res.body.data.id);

                    done();
                });
        });
    });

    describe('GET /api/logs/:logId', () => {
        it('should return 400 if the log id is not a number', (done) => {
            request(server)
                .get('/api/logs/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/logId');
                    expect(titleError.detail).to.equal('"params.logId" must be a number');

                    done();
                });
        });

        it('should return 400 if the log id is not positive', (done) => {
            request(server)
                .get('/api/logs/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/logId');
                    expect(titleError.detail).to.equal('"params.logId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the log id is not a whole number', (done) => {
            request(server)
                .get('/api/logs/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/logId');
                    expect(titleError.detail).to.equal('"params.logId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the log could not be found', (done) => {
            request(server)
                .get('/api/logs/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Log with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/logs/1')
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

    describe('GET /api/logs/:logId/tags', () => {
        it('should return 400 if the log id is not a number', (done) => {
            request(server)
                .get('/api/logs/abc/tags')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/logId');
                    expect(titleError.detail).to.equal('"params.logId" must be a number');

                    done();
                });
        });

        it('should return 404 if the log could not be found', (done) => {
            request(server)
                .get('/api/logs/999999999/tags')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Log with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/logs/1/tags')
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
    });

    describe('GET /api/logs/:logId/tree', () => {
        it('should return 400 if the log id is not a number', (done) => {
            request(server)
                .get('/api/logs/abc/tree')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/logId');
                    expect(titleError.detail).to.equal('"params.logId" must be a number');

                    done();
                });
        });

        it('should return 404 if the log could not be found', (done) => {
            request(server)
                .get('/api/logs/999999999/tree')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Log with this id (999999999) could not be found');

                    done();
                });
        });

        let tree;
        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/logs/1/tree')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    tree = res.body.data;

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/logs/2/tree')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.deep.equal(tree);

                    done();
                });
        });
    });
};
