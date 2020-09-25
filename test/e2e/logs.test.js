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

    let logWithAttachmentsId = 0;
    let attachmentId = 0;

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

        it('should support filtering by title', (done) => {
            request(server)
                .get('/api/logs?filter[title]=Third')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.equal(1);
                    expect(res.body.data[0].title).to.include('Third');

                    done();
                });
        });

        it('should return 400 if the title filter is left empty', (done) => {
            request(server)
                .get('/api/logs?filter[title]= ')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail).to.equal('"query.filter.title" is not allowed to be empty');

                    done();
                });
        });

        it('should support filtering by author', (done) => {
            request(server)
                .get('/api/logs?filter[author]=John')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.be.greaterThan(1);
                    expect(res.body.data[0].author.name).to.include('John');

                    done();
                });
        });

        it('should return 400 if the author filter is left empty', (done) => {
            request(server)
                .get('/api/logs?filter[author]= ')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail).to.equal('"query.filter.author" is not allowed to be empty');

                    done();
                });
        });

        it('should support filtering by creation time', (done) => {
            const timeFrom = 946684800000;
            request(server)
                .get(`/api/logs?filter[created][from]=${timeFrom}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.be.greaterThan(1);
                    expect(res.body.data[0].createdAt).to.be.gte(timeFrom);

                    done();
                });
        });

        it('should support filtering by creation time', (done) => {
            const timeFrom = 946684800000;
            const timeTo = 1577833200000;
            request(server)
                .get(`/api/logs?filter[created][from]=${timeFrom}&filter[created][to]=${timeTo}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.equal(1);
                    expect(res.body.data[0].createdAt).to.be.gte(timeFrom);
                    expect(res.body.data[0].createdAt).to.be.lte(timeTo);

                    done();
                });
        });

        it('should return 400 if given date is invalid', (done) => {
            request(server)
                .get('/api/logs?filter[created][from]=NaN')
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
                        .equal('Creation date must be a real date and in format YYYY-MM-DD or YYYY/MM/DD');

                    done();
                });
        });

        it('should return 400 if filtering in the future', (done) => {
            request(server)
                .get('/api/logs?filter[created][to]=4102531200000')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    let today = new Date();
                    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                    [today] = today.toISOString().split('T');

                    const { errors } = res.body;
                    expect(errors[0].detail).to
                        .equal(`Creation date must be today (${today}T23:59:59.999Z) or earlier`);

                    done();
                });
        });

        it('should return 400 if minimum is larger than maximum', (done) => {
            request(server)
                .get('/api/logs?filter[created][from]=946771200000&filter[created][to]=946684800000')
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

        it('should support filtering by tag', (done) => {
            request(server)
                .get('/api/logs?filter[tag][values]=1&filter[tag][operation]=and')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data
                        .every((log) => log.tags.length > 0 && log.tags.some((tag) => tag.id === 1)))
                        .to.be.true;

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
                    expect(res.body.data
                        .every((log) => log.tags.length > 0 && log.tags.some((tag) => tag.id === 2)
                        && log.tags.some((tag) => tag.id === 5)))
                        .to.be.true;

                    done();
                });
        });

        it('should support filtering by tag', (done) => {
            request(server)
                .get('/api/logs?filter[tag][values]=5,6&filter[tag][operation]=or')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data
                        .every((log) => log.tags.length > 0 && log.tags.some((tag) => tag.id === 5 || tag.id === 6)))
                        .to.be.true;

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

        it('should support sorting, title DESC', (done) => {
            request(server)
                .get('/api/logs?sort[title]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect([data[0].title, data[1].title])
                        .to.deep.equal([data[0].title, data[1].title].sort((a, b) => b.localeCompare(a)));

                    done();
                });
        });

        it('should support sorting, title ASC', (done) => {
            request(server)
                .get('/api/logs?sort[title]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect([data[0].title, data[1].title])
                        .to.deep.equal([data[0].title, data[1].title].sort());

                    done();
                });
        });

        it('should support sorting, author DESC', (done) => {
            request(server)
                .get('/api/logs?sort[author]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect([data[0].author.name, data[1].author.name])
                        .to.deep.equal([data[0].author.name, data[1].author.name].sort((a, b) => b.localeCompare(a)));

                    done();
                });
        });

        it('should support sorting, author ASC', (done) => {
            request(server)
                .get('/api/logs?sort[author]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect([data[0].author.name, data[1].author.name])
                        .to.deep.equal([data[0].author.name, data[1].author.name].sort());

                    done();
                });
        });

        it('should support sorting, createdAt DESC', (done) => {
            request(server)
                .get('/api/logs?sort[createdAt]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect(data[0].createdAt).to.be.greaterThan(data[1].createdAt);

                    done();
                });
        });

        it('should support sorting, createdAt ASC', (done) => {
            request(server)
                .get('/api/logs?sort[createdAt]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    expect(data[1].createdAt).to.be.greaterThan(data[0].createdAt);

                    done();
                });
        });

        it('should support sorting, tags DESC', (done) => {
            request(server)
                .get('/api/logs?sort[tags]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    const dataWithTags = data.filter(({ tags }) => tags.length > 0);
                    const firstAndLastTags =
                        [dataWithTags[0].tags[0].text, dataWithTags[dataWithTags.length - 1].tags[0].text];
                    expect(data[0].tags.length).to.be.greaterThan(0);
                    expect(firstAndLastTags).to.deep.equal(firstAndLastTags.sort((a, b) => b.localeCompare(a)));

                    done();
                });
        });

        it('should support sorting, tags ASC', (done) => {
            request(server)
                .get('/api/logs?sort[tags]=asc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { data } = res.body;
                    const dataWithTags = data.filter(({ tags }) => tags.length > 0);
                    const firstAndLastTags =
                        [dataWithTags[0].tags[0].text, dataWithTags[dataWithTags.length - 1].tags[0].text];
                    expect(data[data.length - 1].tags.length).to.be.greaterThan(0);
                    expect(firstAndLastTags).to.deep.equal(firstAndLastTags.sort());

                    done();
                });
        });

        it('should not allow sorting on multiple columns at once', (done) => {
            request(server)
                .get('/api/logs?sort[title]=asc&sort[createdAt]=desc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    expect(errors[0].detail
                        .startsWith('"query.sort" contains a conflict between exclusive peers')).to.be.true;

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

        it('should return 400 if at least one non-existent tag was provided', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'Text of yet another run',
                    tags: [1, 3, 10, 16],
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Tags with these ids (10, 16) could not be found');

                    done();
                });
        });

        it('should return 400 if an invalid run number was provided', (done) => {
            const runNumbers = '123123123123123123123123123123';
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'Text of yet another run',
                    runNumbers,
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal(`Run with run number '${runNumbers}' could not be found`);

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
                    expect(res.body.data.text).to.equal('Text of yet another run');
                    expect(res.body.data.rootLogId).to.equal(res.body.data.id);
                    expect(res.body.data.parentLogId).to.equal(res.body.data.id);

                    done();
                });
        });

        it('should return 201 if a proper body was sent', (done) => {
            request(server)
                .post('/api/logs')
                .send({
                    title: 'Yet another run',
                    text: 'Text of yet another run',
                    tags: [1, 2],
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
                    expect(res.body.data.text).to.equal('Text of yet another run');
                    expect(res.body.data.tags).to.deep.equal([
                        {
                            id: 1,
                            text: 'FOOD',
                        },
                        {
                            id: 2,
                            text: 'RUN',
                        },
                    ]);
                    expect(res.body.data.rootLogId).to.equal(1);
                    expect(res.body.data.parentLogId).to.equal(2);

                    done();
                });
        });

        // 'send' and 'attach' are incompatible so we use 'field' instead
        it('should return 201 if a proper body with file attachments was sent', (done) => {
            request(server)
                .post('/api/logs')
                .field('title', 'Yet another run')
                .field('text', 'Text of yet another run')
                .attach('attachments.0', path.resolve(__dirname, '..', 'assets', '1200px-CERN_logo.png'))
                .attach('attachments.1', path.resolve(__dirname, '..', 'assets', 'hadron_collider.jpg'))
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.attachments[0].originalName).to.equal('1200px-CERN_logo.png');
                    expect(res.body.data.attachments[1].originalName).to.equal('hadron_collider.jpg');

                    logWithAttachmentsId = res.body.data.id;
                    attachmentId = res.body.data.attachments[0].id;

                    done();
                });
        });

        it('should return 201 if a proper body with run number was sent', (done) => {
            request(server)
                .post('/api/logs')
                .field('title', 'Yet another run')
                .field('text', 'Text of yet another run')
                .field('runNumbers', '1')
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.runs).to.deep.include({id: 1, runNumber: 1});

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

    describe('GET /api/logs/:logId/attachments', () => {
        it('should return an array', (done) => {
            request(server)
                .get(`/api/logs/${logWithAttachmentsId}/attachments`)
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

        it('should return an array of attachments of specific mime-type', (done) => {
            request(server)
                .get(`/api/logs/${logWithAttachmentsId}/attachments?mimetype=image/png`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.equal(1);
                    expect(res.body.data[0].mimeType).to.equal('image/png');
                    done();
                });
        });

        it('should return an array of attachments of specific mime-type group', (done) => {
            request(server)
                .get(`/api/logs/${logWithAttachmentsId}/attachments?mimetype=image`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.equal(2);
                    expect(res.body.data).to.satisfy((files) =>
                        files.every((file) => file.mimeType.match(/^image\//)));
                    done();
                });
        });

        it('should return 404 if log does not exist', (done) => {
            request(server)
                .get('/api/logs/999/attachments')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    /*
                     * Response must satisfy the OpenAPI specification
                     * expect(res).to.satisfyApiSpec;
                     */

                    expect(res.body.errors[0].title).to.equal('Log with this id (999) could not be found');

                    done();
                });
        });

        it('should return 400 if there is an disallowed query parameter', (done) => {
            request(server)
                .get(`/api/logs/${logWithAttachmentsId}/attachments?mayI=no`)
                .expect(400)
                .end((err, _res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    /*
                     * Response must satisfy the OpenAPI specification
                     * expect(res).to.satisfyApiSpec;
                     */

                    done();
                });
        });
    });

    describe('GET /api/logs/:logId/attachments/:attachmentId', () => {
        it('should return an attachment', (done) => {
            request(server)
                .get(`/api/logs/${logWithAttachmentsId}/attachments/${attachmentId}`)
                .expect(200)
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    /*
                     * Response must satisfy the OpenAPI specification
                     * expect(res).to.satisfyApiSpec;
                     */
                    done();
                });
        });

        it('should return 404 if log can not be found', (done) => {
            request(server)
                .get('/api/logs/999/attachments/1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    /*
                     * Response must satisfy the OpenAPI specification
                     * expect(res).to.satisfyApiSpec;
                     */

                    const { errors } = res.body;
                    expect(errors[0].title).to
                        .equal('Log with this id (999) does not have Attachment with this id (1)');

                    done();
                });
        });

        it('should return 404 if log does not have attachment with given id', (done) => {
            request(server)
                .get(`/api/logs/${logWithAttachmentsId}/attachments/999`)
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    /*
                     * Response must satisfy the OpenAPI specification
                     * expect(res).to.satisfyApiSpec;
                     */

                    const { errors } = res.body;
                    expect(errors[0].title).to
                        .equal('Attachment with this id (999) could not be found');

                    done();
                });
        });
    });
};
