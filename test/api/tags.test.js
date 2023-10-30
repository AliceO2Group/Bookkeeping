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
const { tag: { CreateTagUseCase } } = require('../../lib/usecases');
const { dtos: { CreateTagDto } } = require('../../lib/domain');
const { beforeEach } = require('mocha');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

const { server } = require('../../lib/application');

module.exports = () => {
    before(resetDatabaseContent);

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

                    expect(res.body.data).to.be.an('array');

                    done();
                });
        });

        it('should return tags filtered by partial text', async () => {
            const response = await request(server).get('/api/tags?filter[partialText]=-TAG-');
            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.length).to.equal(34);
        });

        it('should return 204 if no tags match partial search', async () => {
            const response = await request(server).get('/api/tags?filter[partialText]=DO-NOT-EXISTS');
            expect(response.status).to.equal(204);
        });
    });

    describe('POST /api/tags', () => {
        it('should return 400 if no text is provided', (done) => {
            request(server)
                .post('/api/tags?token=admin')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail).to.equal('"body.text" is required');

                    done();
                });
        });

        it('should return 400 if the title is too short', (done) => {
            request(server)
                .post('/api/tags?token=admin')
                .send({
                    text: 'A',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail).to.equal('"body.text" length must be at least 2 characters long');

                    done();
                });
        });
        it('should return 400 if the title has illegal characters', (done) => {
            request(server)
                .post('/api/tags?token=admin')
                .send({
                    text: '^%$#@',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail).to.equal('"body.text" Text can only include words, digits and "-+"');

                    done();
                });
        });
        it('should return 400 if the title is too long', (done) => {
            request(server)
                .post('/api/tags?token=admin')
                .send({
                    text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/text');
                    expect(titleError.detail)
                        .to.equal('"body.text" length must be less than or equal to 20 characters long');

                    done();
                });
        });

        it('should return 201 if a proper body was sent', async () => {
            const expectedText = `UNIX:${new Date().getTime()}`;
            const response = await request(server).post('/api/tags?token=admin').send({
                text: expectedText,
            });

            expect(response.status).to.equal(201);
            expect(response.body.data.text).to.equal(expectedText);
        });

        it('should return 409 if we are creating the same tag again', (done) => {
            request(server)
                .post('/api/tags?token=admin')
                .send({
                    text: 'FOOD',
                })
                .expect(409)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

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

                    expect(res.body.data.text).to.equal('test123123');
                    expect(res.body.data.mattermost).to.equal('test-test');
                    expect(res.body.data.email).to.equal('cake@cern.ch,test@cern.ch');

                    done();
                });
        });
        it('should return 403 with no admin rights', (done) => {
            request(server)
                .post('/api/tags?token=guest')
                .send({
                    text: 'test123123',
                    mattermost: 'test-test',
                    email: 'cake@cern.ch,test@cern.ch',
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
        it('should successfully create a tag with a description', async () => {
            const response = await request(server).post('/api/tags?token=admin').send({
                text: 'test-with-desc',
                description: 'The tag\'s description!',
            });

            expect(response.status).to.equal(201);
            expect(response.body.data.text).to.equal('test-with-desc');
            expect(response.body.data.description).to.equal('The tag\'s description!');
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
                .delete('/api/tags/abc?token=admin')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a number');

                    done();
                });
        });

        it('should return 400 if the tag id is not positive', (done) => {
            request(server)
                .delete('/api/tags/-1?token=admin')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the tag id is not a whole number', (done) => {
            request(server)
                .delete('/api/tags/0.5?token=admin')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/tagId');
                    expect(titleError.detail).to.equal('"params.tagId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the tag could not be found', (done) => {
            request(server)
                .delete('/api/tags/999999999?token=admin')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Tag with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .delete(`/api/tags/${createdTag.id}?token=admin`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

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
                    expect(res.body.data.text).to.equal('FOOD');

                    done();
                });
        });

        it('should return 200 if urlencoded is given', (done) => {
            request(server)
                .get('/api/tags/name?name=DCS')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.text).to.equal('DCS');
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
                .put(`/api/tags/${createdTag.id}?token=cq2i5642qai6ct4`)
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
        it('should successfully archive the given tag', async () => {
            const now = Date.now();
            const response = await request(server).put(`/api/tags/${createdTag.id}?token=admin`).send({ archivedAt: now });

            expect(response.status).to.equal(201);
            expect(response.body.data).to.be.an('object');
            expect(response.body.data.archived).to.be.true;
        });

        it('should sucessfully update the given tag description', async () => {
            const response = await request(server)
                .put(`/api/tags/${createdTag.id}?token=admin`)
                .send({ description: 'A whole new description' });

            expect(response.status).to.equal(201);
            expect(response.body.data).to.be.an('object');
            expect(response.body.data.description).to.equal('A whole new description');
        });
    });
};
