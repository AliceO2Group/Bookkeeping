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
const { expectObjectToBeSuperset } = require('../utilities/expectObjectToBeSuperset');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/qcFlagTypes/:id', () => {
        it('should successfuly fetch one QC flag type', (done) => {
            request(server)
                .get('/api/qcFlagTypes/13')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: flagType } = res.body;
                    delete flagType.createdAt;
                    delete flagType.updatedAt;
                    expect(flagType).to.be.eql({
                        id: 13,
                        name: 'Bad',
                        method: 'Bad',
                        bad: true,
                        color: null,

                        archived: false,
                        archivedAt: null,

                        createdById: 1,
                        createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                        lastUpdatedById: null,
                        lastUpdatedBy: null,
                    });
                    done();
                });
        });

        it('should send error that QC flag type with given id cannot be found', (done) => {
            request(server)
                .get('/api/qcFlagTypes/99999')
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
                            detail: 'Quality Control Flag Type with this id (99999) could not be found',
                        },
                    ]);

                    done();
                });
        });
    });

    describe('GET /api/qcFlagTypes', () => {
        it('should successfuly fetch all qc flag types', (done) => {
            request(server)
                .get('/api/qcFlagTypes')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(6);

                    expect(flagTypes.map((qcFlagType) => {
                        delete qcFlagType.createdAt;
                        delete qcFlagType.updatedAt;
                        return qcFlagType;
                    })).to.have.all.deep.members([
                        {
                            id: 2,
                            name: 'UnknownQuality',
                            method: 'Unknown Quality',
                            bad: true,
                            color: null,

                            archived: false,
                            archivedAt: null,

                            createdById: 1,
                            createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                            lastUpdatedById: null,
                            lastUpdatedBy: null,
                        },
                        {
                            id: 3,
                            name: 'CertifiedByExpert',
                            method: 'Certified by Expert',
                            bad: false,
                            color: null,

                            archived: false,
                            archivedAt: null,

                            createdById: 1,
                            createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                            lastUpdatedById: null,
                            lastUpdatedBy: null,
                        },
                        {
                            id: 11,
                            name: 'LimitedAcceptance',
                            method: 'Limited acceptance',
                            bad: true,
                            color: '#FFFF00',

                            archived: false,
                            archivedAt: null,

                            createdById: 1,
                            createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                            lastUpdatedById: null,
                            lastUpdatedBy: null,
                        },
                        {
                            id: 12,
                            name: 'BadPID',
                            method: 'Bad PID',
                            bad: true,
                            color: null,

                            archived: false,
                            archivedAt: null,

                            createdById: 1,
                            createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                            lastUpdatedById: null,
                            lastUpdatedBy: null,
                        },
                        {
                            id: 13,
                            name: 'Bad',
                            method: 'Bad',
                            bad: true,
                            color: null,

                            archived: false,
                            archivedAt: null,

                            createdById: 1,
                            createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                            lastUpdatedById: null,
                            lastUpdatedBy: null,
                        },
                        {
                            id: 20,
                            name: 'Archived',
                            method: 'Archived',
                            bad: false,
                            color: null,

                            createdById: 1,
                            createdBy: { id: 1, externalId: 1, name: 'John Doe' },

                            archived: true,
                            archivedAt: 1710504000000,

                            lastUpdatedById: null,
                            lastUpdatedBy: null,
                        },
                    ]);
                    done();
                });
        });

        it('should successfuly filter QC flag types by id', (done) => {
            request(server)
                .get('/api/qcFlagTypes?filter[ids][]=3')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 1, pageCount: 1 } });
                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(1);

                    expect(flagTypes.map(({ id }) => id)).to.have.all.deep.members([3]);
                    done();
                });
        });

        it('should successfuly filter QC flag types by names pattern', (done) => {
            request(server)
                .get('/api/qcFlagTypes?filter[names][]=Bad')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });
                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(2);

                    expect(flagTypes.map(({ name }) => name)).to.have.all.deep.members(['Bad', 'BadPID']);
                    done();
                });
        });

        it('should successfuly filter QC flag types by names', (done) => {
            request(server)
                .get('/api/qcFlagTypes?filter[names][]=Bad&filter[names][]=LimitedAcceptance')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });
                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(2);

                    expect(flagTypes.map(({ name }) => name)).to.have.all.deep.members(['Bad', 'LimitedAcceptance']);
                    done();
                });
        });

        it('should successfuly filter QC flag types by mathods pattern', (done) => {
            request(server)
                .get('/api/qcFlagTypes?filter[methods][]=Bad')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(2);

                    expect(flagTypes.map(({ method }) => method)).to.have.all.deep.members(['Bad', 'Bad PID']);
                    done();
                });
        });

        it('should successfuly filter QC flag types by methods patterns', (done) => {
            request(server)
                .get('/api/qcFlagTypes?filter[methods][]=Bad')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(2);

                    expect(flagTypes.map(({ method }) => method)).to.have.all.deep.members(['Bad', 'Bad PID']);
                    done();
                });
        });

        it('should successfuly filter QC flag types by whether the flag is `bad`', (done) => {
            request(server)
                .get('/api/qcFlagTypes?filter[bad]=false')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(2);

                    expect(flagTypes.map(({ name }) => name)).to.have.all.deep.members(['CertifiedByExpert', 'Archived']);
                    done();
                });
        });

        it('should successfuly sort QC flag types by id', (done) => {
            request(server)
                .get('/api/qcFlagTypes?sort[id]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(6);

                    expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([20, 13, 12, 11, 3, 2]);
                    done();
                });
        });

        it('should successfuly sort QC flag types by name', (done) => {
            request(server)
                .get('/api/qcFlagTypes?sort[name]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(6);

                    expect(flagTypes.map(({ name }) => name)).to.have.all.ordered.members([
                        'UnknownQuality',
                        'LimitedAcceptance',
                        'CertifiedByExpert',
                        'BadPID',
                        'Bad',
                        'Archived',
                    ]);
                    done();
                });
        });

        it('should successfuly sort QC flag types by method', (done) => {
            request(server)
                .get('/api/qcFlagTypes?sort[method]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 1 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(6);

                    expect(flagTypes.map(({ name }) => name)).to.have.all.ordered.members([
                        'Archived',
                        'Bad',
                        'BadPID',
                        'CertifiedByExpert',
                        'LimitedAcceptance',
                        'UnknownQuality',
                    ]);
                    done();
                });
        });

        it('should successfuly apply pagination of QC flag types', (done) => {
            request(server)
                .get('/api/qcFlagTypes?page[limit]=2&page[offset]=2&sort[id]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { meta, data: flagTypes } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 3 } });

                    expect(flagTypes).to.be.an('array');
                    expect(flagTypes).to.be.lengthOf(2);

                    expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([11, 12]);
                    done();
                });
        });
    });

    describe('POST /api/qcFlagTypes', () => {
        it('should successfuly create QC Flag Type', (done) => {
            const parameters = {
                name: 'A',
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
            };

            request(server)
                .post('/api/qcFlagTypes?token=admin')
                .send(parameters)
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: newQCFlag } = res.body;
                    expectObjectToBeSuperset(newQCFlag, parameters);
                    done();
                });
        });

        it('should fail when no name is provided', (done) => {
            const parameters = {
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
            };

            request(server)
                .post('/api/qcFlagTypes?token=admin')
                .send(parameters)
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

        it('should fail when no method is provided', (done) => {
            const parameters = {
                name: 'A',
                bad: false,
                color: '#FFAA00',
            };

            request(server)
                .post('/api/qcFlagTypes?token=admin')
                .send(parameters)
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/method');
                    expect(titleError.detail).to.equal('"body.method" is required');

                    done();
                });
        });

        it('should fail when no bad info is provided', (done) => {
            const parameters = {
                name: 'A',
                method: 'A++',
                color: '#FFAA00',
            };

            request(server)
                .post('/api/qcFlagTypes?token=admin')
                .send(parameters)
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/bad');
                    expect(titleError.detail).to.equal('"body.bad" is required');

                    done();
                });
        });
    });
};
