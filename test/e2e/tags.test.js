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
const { tag: { CreateTagUseCase } } = require('../../lib/usecases');
const { dtos: { CreateTagDto } } = require('../../lib/domain');
const { beforeEach } = require('mocha');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const { server } = require('../../lib/application');

    describe('GET /api/tags', () => {
        it('should return an array', (done) => {
            request(server)
                .get('/api/tags')
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

        it('should support pagination, offset 0 and limit 1', (done) => {
            request(server)
                .get('/api/tags?page[offset]=0&page[limit]=1')
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
                .get('/api/tags?page[offset]=1&page[limit]=1')
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
                .get('/api/tags?page[offset]=0&page[limit]=0')
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
                    expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');

                    done();
                });
        });
    });

    describe('POST /api/tags', () => {
        it('should return 400 if no text is provided', (done) => {
            request(server)
                .post('/api/tags')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail).to.equal('"body.text" is required');

                    done();
                });
        });

        it('should return 400 if the title is too short', (done) => {
            request(server)
                .post('/api/tags')
                .send({
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
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail).to.equal('"body.text" length must be at least 3 characters long');

                    done();
                });
        });
        it('should return 400 if the title has illegal characters', (done) => {
            request(server)
                .post('/api/tags')
                .send({
                    text: '^%$#@',
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
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail).to.equal('"body.text" Text can only include words, digits, spaces and "-+"');

                    done();
                });
        });
        it('should return 400 if the title is too long', (done) => {
            request(server)
                .post('/api/tags')
                .send({
                    text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
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
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail)
                        .to.equal('"body.text" length must be less than or equal to 20 characters long');

                    done();
                });
        });

        it('should return 201 if a proper body was sent', (done) => {
            const expectedText = `UNIX:${new Date().getTime()}`;
            request(server)
                .post('/api/tags')
                .send({
                    text: expectedText,
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.text).to.equal(expectedText);

                    done();
                });
        });

        it('should return 409 if we are creating the same tag again', (done) => {
            request(server)
                .post('/api/tags')
                .send({
                    text: 'FOOD',
                })
                .expect(409)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].detail).to.equal('The provided entity already exists');

                    done();
                });
        });
        it('should return 201 if email/mattermost are filled in with admin rights', (done) => {
            request(server)
                .post('/api/tags?token=admin')
                .send({
                    text: 'test123123',
                    mattermost: 'test-test',
                    email: 'cake@cern.ch,test@cern.ch',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.text).to.equal('test123123');
                    expect(res.body.data.mattermost).to.equal('test-test');
                    expect(res.body.data.email).to.equal('cake@cern.ch,test@cern.ch');

                    done();
                });
        });
        it('should return 201 only text is filled in with no admin rights', (done) => {
            request(server)
                .post('/api/tags?token=guest')
                .send({
                    text: 'guestTest',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    done();
                });
        });
        it('should return 403 if email/mattermost are filled in with no admin rights', (done) => {
            request(server)
                .post('/api/tags?token=guest')
                .send({
                    text: 'test123123',
                    mattermost: 'test-test',
                    email: 'cake@cern.ch,test@cern.ch',
                })
                .expect(403)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    done();
                });
        });
        it('should return 403 if email/mattermost are filled in with no admin rights', (done) => {
            request(server)
                .post('/api/tags?token=guest')
                .send({
                    text: 'test123123',
                    mattermost: 'test-test',
                })
                .expect(403)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    done();
                });
        });
        it('should return 403 if only email is filled in with no admin rights', (done) => {
            request(server)
                .post('/api/tags')
                .send({
                    text: 'test123123',
                    email: 'cake@cern.ch,test@cern.ch',
                })
                .expect(403)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    done();
                });
        });
    });

    describe('GET /api/tags/:tagId', () => {
        it('should return 400 if the tag id is not a number', (done) => {
            request(server)
                .get('/api/tags/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a number');

                    done();
                });
        });

        it('should return 400 if the tag id is not positive', (done) => {
            request(server)
                .get('/api/tags/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the tag id is not a whole number', (done) => {
            request(server)
                .get('/api/tags/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the tag could not be found', (done) => {
            request(server)
                .get('/api/tags/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Tag with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/tags/1')
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

    describe('DELETE /api/tags/:tagId', () => {
        let createdTag;

        beforeEach(async () => {
            const createTagDto = await CreateTagDto.validateAsync({
                body: {
                    text: `TAG#${new Date().getTime()}`,
                },
            });

            createdTag = await new CreateTagUseCase()
                .execute(createTagDto);
        });

        it('should return 400 if the tag id is not a number', (done) => {
            request(server)
                .delete('/api/tags/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a number');

                    done();
                });
        });

        it('should return 400 if the tag id is not positive', (done) => {
            request(server)
                .delete('/api/tags/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the tag id is not a whole number', (done) => {
            request(server)
                .delete('/api/tags/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the tag could not be found', (done) => {
            request(server)
                .delete('/api/tags/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Tag with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .delete(`/api/tags/${createdTag.id}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.id).to.equal(createdTag.id);
                    expect(res.body.data.text).to.equal(createdTag.text);

                    done();
                });
        });
    });

    describe('GET /api/tags/:tagId/logs', () => {
        it('should return 400 if the tag id is not a number', (done) => {
            request(server)
                .get('/api/tags/abc/logs')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a number');

                    done();
                });
        });

        it('should return 404 if the tag could not be found', (done) => {
            request(server)
                .get('/api/tags/999999999/logs')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Tag with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/tags/1/logs')
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
    });
    describe('GET /api/tags/name', () => {
        it('should return 200 if a valid query is given', (done) => {
            request(server)
                .get('/api/tags/name?name=FOOD')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.data.text).to.equal('FOOD');

                    done();
                });
        });

        it('should return 200 if urlencoded is given', (done) => {
            request(server)
                .get('/api/tags/name?name=TEST%2FTAG%200')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.data.text).to.equal('TEST/TAG 0');
                    expect(res.body.data.email).to.equal('cake@cern.ch');
                    done();
                });
        });

        it('should return 404 if the tag id does not exist', (done) => {
            request(server)
                .get('/api/tags/name?name=1234')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Tag with this name (1234) could not be found');

                    done();
                });
        });
        it('should return 404 if the tag id does not exist', (done) => {
            request(server)
                .get('/api/tags/name?notRightName=1234')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;

                    expect(res.body.errors[0].title).to.equal('Invalid Attribute');

                    done();
                });
        });
    });
    describe('PUT /api/tags', () => {
        let createdTag;

        beforeEach(async () => {
            const createTagDto = await CreateTagDto.validateAsync({
                body: {
                    text: `TAG#${new Date().getTime()}`,
                },
            });
            createdTag = await new CreateTagUseCase()
                .execute(createTagDto);
        });

        it('should return 201 if no text is provided', (done) => {
            request(server)
                .put(`/api/tags/${createdTag.id}?token=admin`)
                .send({
                    email: '',
                    mattermost: '',
                })
                .expect(201)
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
                .put(`/api/tags/${createdTag.id}?token=admin`)
                .send({
                    email: 'groupa@cern.ch,groupb@cern.ch',
                    mattermost: 'groupa,groupb',
                })
                .expect(201)
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    done();
                });
        });
        it('should return 400 if invalid email is given', (done) => {
            request(server)
                .put(`/api/tags/${createdTag.id}?token=admin`)
                .send({
                    email: '(*&^%$#@)',
                    mattermost: 'group1,group-2,group/3',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/email');
                    expect(titleError.detail).to.equal('"body.email" must be a valid email');
                    done();
                });
        });
        it('Should return 403 when no valid token is given', (done) => {
            request(server)
                .put(`/api/tags/${createdTag.id}?token=guest`)
                .send({
                    email: 'groupa@cern.ch,groupb@cern.ch',
                    mattermost: 'groupa,groupb',
                })
                .expect(403)
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    done();
                });
        });
        it('Should return 403 when no token is given', (done) => {
            request(server)
                .put(`/api/tags/${createdTag.id}`)
                .send({
                    email: 'groupa@cern.ch,groupb@cern.ch',
                    mattermost: 'groupa,groupb',
                })
                .expect(403)
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    done();
                });
        });
    });
};
