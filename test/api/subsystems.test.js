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
const {
    dtos: {
        CreateSubsystemDto,
    },
} = require('../../lib/domain');
const {
    subsystem: {
        CreateSubsystemUseCase,
    },
} = require('../../lib/usecases');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { server } = require('../../lib/application');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/subsystems', () => {
        it('should return an array', (done) => {
            request(server)
                .get('/api/subsystems')
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
                .get('/api/subsystems?page[offset]=0&page[limit]=1')
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
                .get('/api/subsystems?page[offset]=1&page[limit]=1')
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
                .get('/api/subsystems?page[offset]=0&page[limit]=0')
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

    describe('POST /api/subsystems', () => {
        it('should return 400 if no name is provided', (done) => {
            request(server)
                .post('/api/subsystems')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/name');
                    expect(titleError.detail).to.equal('"body.name" is required');

                    done();
                });
        });

        it('should return 201 if a proper body was sent', (done) => {
            const expectedName = `UNIX:${new Date().getTime()}`;
            request(server)
                .post('/api/subsystems')
                .send({
                    name: expectedName,
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.name).to.equal(expectedName);

                    done();
                });
        });

        it('should return 409 if we are creating the same subsystem again', (done) => {
            request(server)
                .post('/api/subsystems')
                .send({
                    name: 'Subsystem Plant #1',
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
    });

    describe('GET /api/subsystems/:subsystemId', () => {
        it('should return 400 if the subsystem id is not a number', (done) => {
            request(server)
                .get('/api/subsystems/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError =
                        errors.find((err) => err.source.pointer === '/data/attributes/params/subsystemId');
                    expect(titleError.detail).to.equal('"params.subsystemId" must be a number');

                    done();
                });
        });

        it('should return 400 if the subsystem id is not positive', (done) => {
            request(server)
                .get('/api/subsystems/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const error = errors.find((err) => err.source.pointer === '/data/attributes/params/subsystemId');
                    expect(error.detail).to.equal('"params.subsystemId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the subsystem id is not a whole number', (done) => {
            request(server)
                .get('/api/subsystems/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const error = errors.find((err) => err.source.pointer === '/data/attributes/params/subsystemId');
                    expect(error.detail).to.equal('"params.subsystemId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the subsystem could not be found', (done) => {
            request(server)
                .get('/api/subsystems/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Subsystem with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/subsystems/1')
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

    describe('DELETE /api/subsystems/:subsystemId', () => {
        let createdSubsystem;

        beforeEach(async () => {
            const createSubsystemDto = await CreateSubsystemDto.validateAsync({
                body: {
                    name: `SUBSYSTEM#${new Date().getTime()}`,
                },
            });

            createdSubsystem = await new CreateSubsystemUseCase()
                .execute(createSubsystemDto);
        });

        it('should return 400 if the subsystem id is not a number', (done) => {
            request(server)
                .delete('/api/subsystems/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const error = errors.find((err) => err.source.pointer === '/data/attributes/params/subsystemId');
                    expect(error.detail).to.equal('"params.subsystemId" must be a number');

                    done();
                });
        });

        it('should return 400 if the subsystem id is not positive', (done) => {
            request(server)
                .delete('/api/subsystems/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const error = errors.find((err) => err.source.pointer === '/data/attributes/params/subsystemId');
                    expect(error.detail).to.equal('"params.subsystemId" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the subsystem id is not a whole number', (done) => {
            request(server)
                .delete('/api/subsystems/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const error = errors.find((err) => err.source.pointer === '/data/attributes/params/subsystemId');
                    expect(error.detail).to.equal('"params.subsystemId" must be an integer');

                    done();
                });
        });

        it('should return 404 if the subsystem could not be found', (done) => {
            request(server)
                .delete('/api/subsystems/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Subsystem with this id (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .delete(`/api/subsystems/${createdSubsystem.id}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.id).to.equal(createdSubsystem.id);
                    expect(res.body.data.name).to.equal(createdSubsystem.name);

                    done();
                });
        });
    });
};
