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

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/qualityControlFlags/reasons', () => {
        it('should successfuly fetch all qc flag reasons', (done) => {
            request(server)
                .get('/api/qualityControlFlags/reasons')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(5);
                    expect(data).to.have.deep.all.members([
                        {
                            id: 2,
                            name: 'UnknownQuality',
                            method: 'Unknown Quality',
                            bad: true,
                            obsolate: true,
                        },
                        {
                            id: 3,
                            name: 'CertifiedByExpert',
                            method: 'Certified by Expert',
                            bad: false,
                            obsolate: true,
                        },
                        {
                            id: 11,
                            name: 'LimitedAcceptance',
                            method: 'Limited acceptance',
                            bad: true,
                            obsolate: true,
                        },
                        {
                            id: 12,
                            name: 'BadPID',
                            method: 'Bad PID',
                            bad: true,
                            obsolate: true,
                        },
                        {
                            id: 13,
                            name: 'Bad',
                            method: 'Bad',
                            bad: true,
                            obsolate: false,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('GET /api/qualityControlFlags', () => {
        it('should successfuly fetch all data', (done) => {
            request(server)
                .get('/api/qualityControlFlags')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data, meta } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 4, pageCount: 1 } });
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(4);
                    expect(data).to.include.deep.members([
                        {
                            id: 4,
                            timeStart: 1647924400000,
                            timeEnd: 1647924400000,
                            comment: 'Some qc comment 4',
                            provenance: 'HUMAN',
                            createdAt: 1707825436 * 1000,
                            dataPassId: 2,
                            runNumber: 1,
                            detectorId: 1,
                            userId: 2,
                            user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                            flagReasonId: 13,
                            flagReason: { id: 13, name: 'Bad', method: 'Bad', bad: true, obsolate: false },
                            verifications: [
                                {
                                    id: 2,
                                    userId: 1,
                                    user: { id: 1, externalId: 1, name: 'John Doe' },
                                    comment: 'Accepted: Some qc comment 1',
                                    createdAt: 1707825436 * 1000,
                                },
                            ],
                        },
                    ]);

                    done();
                });
        });
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/qualityControlFlags?filter[ids][]=1')
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
                    expect(Object.entries(data[0])).to.include.all.deep.members(Object.entries({
                        id: 1,
                        timeStart: (1565314200 - 10000) * 1000,
                        timeEnd: (1565314200 + 10000) * 1000,
                        comment: 'Some qc comment 1',
                        provenance: 'HUMAN',
                    }));

                    done();
                });
        });
        it('should successfuly filter on dataPassIds, runNumbers, detectorIds', (done) => {
            request(server)
                .get('/api/qualityControlFlags/?filter[dataPassIds][]=1&filter[runNumbers][]=106&filter[detectorIds][]=1')
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
                    expect(data.map(({ id }) => id)).to.have.all.members([1, 2, 3]);
                    done();
                });
        });
        it('should retrive no records when filtering on ids', (done) => {
            request(server)
                .get('/api/qualityControlFlags?filter[ids][]=9999')
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
        it('should successfuly filter on externalUserIds', (done) => {
            request(server)
                .get('/api/qualityControlFlags?filter[externalUserIds][]=456')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0].id).to.be.equal(4);

                    done();
                });
        });
        it('should successfuly filter on userName', (done) => {
            request(server)
                .get('/api/qualityControlFlags?filter[userNames][]=John%20Doe')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(3);
                    expect(data.map(({ id }) => id)).to.have.all.members([1, 2, 3]);

                    done();
                });
        });
        it('should support sorting on id', (done) => {
            request(server)
                .get('/api/qualityControlFlags?sort[id]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: qualityControlFlags } = res.body;
                    expect(qualityControlFlags).to.be.an('array');
                    expect(qualityControlFlags.map(({ id }) => id)).to.have.ordered.deep.members([1, 2, 3, 4]);

                    done();
                });
        });
        it('should support sorting on timeStart', (done) => {
            request(server)
                .get('/api/qualityControlFlags?sort[timeStart]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: qualityControlFlags } = res.body;
                    expect(qualityControlFlags).to.be.an('array');
                    expect(qualityControlFlags.map(({ id }) => id)).to.have.ordered.deep.members([4, 3, 2, 1]);

                    done();
                });
        });
        it('should support sorting on timeEnd', (done) => {
            request(server)
                .get('/api/qualityControlFlags?sort[timeEnd]=DESC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: qualityControlFlags } = res.body;
                    expect(qualityControlFlags).to.be.an('array');
                    expect(qualityControlFlags.map(({ id }) => id)).to.have.ordered.deep.members([4, 3, 2, 1]);

                    done();
                });
        });
        it('should support pagination', (done) => {
            request(server)
                .get('/api/qualityControlFlags?page[offset]=1&page[limit]=2&sort[id]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: qualityControlFlags } = res.body;
                    expect(qualityControlFlags).to.be.an('array');
                    expect(qualityControlFlags.map(({ id }) => id)).to.have.ordered.deep.members([2, 3]);

                    done();
                });
        });
        it('should return 400 when bad query paramter provided', (done) => {
            request(server)
                .get('/api/qualityControlFlags?a=1')
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
                .get('/api/qualityControlFlags?page[limit]=0')
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
                .get('/api/qualityControlFlags?page[limit]=0')
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

    describe('POST /api/qualityControlFlags', () => {
        it('should successfuly create flag instance', (done) => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 - 10) * 1000,
                timeEnd: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 456,
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 1,
                detectorId: 1,
            };

            request(server)
                .post('/api/qualityControlFlags')
                .send(qcFlagCreationParameters)
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    delete qcFlagCreationParameters.externalUserId;
                    expect(Object.entries(data)).to.include.all.deep.members(Object.entries(qcFlagCreationParameters));

                    done();
                });
        });

        it('should successfuly create flag instance', (done) => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 - 10) * 1000,
                timeEnd: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 456,
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 9999, // Failing property
                detectorId: 111, // Failing property
            };

            const expectedError = `
            You cannot insert flag for data pass (id:${9999}), run (runNumber:${106}), detector (id:${111})
            as there is no association between them
            `;

            request(server)
                .post('/api/qualityControlFlags')
                .send(qcFlagCreationParameters)
                .expect(201)
                .end((err) => {
                    if (err) {
                        expect(err[0].tit)
                        done();
                    } else {
                        done('Should reject');
                    }
                });
        });
    });
};
