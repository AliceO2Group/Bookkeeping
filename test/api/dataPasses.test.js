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
const { DetectorType } = require('../../lib/domain/enums/DetectorTypes');
const { BkpRoles } = require('../../lib/domain/enums/BkpRoles');

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    versions: [
        {
            id: 1,
            dataPassId: 1,
            description: 'Some random desc',
            reconstructedEventsCount: 50948694,
            outputSize: 56875682112600,
            lastSeen: 108,
            deletedFromMonAlisa: true,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

const LHC22b_apass2 = {
    id: 2,
    name: 'LHC22b_apass2',
    versions: [
        {
            id: 2,
            dataPassId: 2,
            description: 'Some random desc 2',
            reconstructedEventsCount: 50848604,
            outputSize: 55765671112610,
            lastSeen: 55,
            deletedFromMonAlisa: false,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

const LHC22a_apass1 = {
    id: 3,
    name: 'LHC22a_apass1',
    versions: [
        {
            id: 3,
            dataPassId: 3,
            description: 'Some random desc for apass 1',
            reconstructedEventsCount: 50848111,
            outputSize: 55761110122610,
            lastSeen: 105,
            deletedFromMonAlisa: false,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 4,
    simulationPassesCount: 2,
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/dataPasses', () => {
        it('should successfuly fetch all data', (done) => {
            request(server)
                .get('/api/dataPasses')
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
                .get('/api/dataPasses?filter[ids][]=1')
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
                    expect(data[0]).to.be.eql(LHC22b_apass1);

                    done();
                });
        });
        it('should successfuly filter on names', (done) => {
            request(server)
                .get('/api/dataPasses?filter[names][]=LHC22b_apass2')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0]).to.be.eql(LHC22b_apass2);

                    done();
                });
        });
        it('should retrive no records when filtering on ids', (done) => {
            request(server)
                .get('/api/dataPasses?filter[ids][]=9999')
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
                .get('/api/dataPasses?filter[names][]=LHC22b_aasdfpass2asdf')
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
                .get('/api/dataPasses?filter[ids][]=1&filter[ids][]=2')
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
        it('should succefully filter on lhcPeriodIds', (done) => {
            request(server)
                .get('/api/dataPasses?filter[lhcPeriodIds][]=2')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: dataPasses } = res.body;
                    expect(dataPasses).to.be.an('array');
                    expect(dataPasses).to.be.lengthOf(2);
                    expect(dataPasses).to.have.deep.members([LHC22b_apass2, LHC22b_apass1]);
                    done();
                });
        });
        it('should succefully filter on simulationPassIds', (done) => {
            request(server)
                .get('/api/dataPasses?filter[simulationPassIds][]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: dataPasses } = res.body;
                    expect(dataPasses).to.be.an('array');
                    expect(dataPasses).to.have.all.deep.members([LHC22b_apass1, LHC22b_apass2]);
                    done();
                });
        });
        it('should successfuly sort on id and name', (done) => {
            request(server)
                .get('/api/dataPasses?sort[id]=DESC&sort[name]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: dataPasses } = res.body;
                    expect(dataPasses).to.be.an('array');
                    expect(dataPasses).to.be.lengthOf(3);
                    expect(dataPasses).to.have.ordered.deep.members([
                        LHC22a_apass1,
                        LHC22b_apass2,
                        LHC22b_apass1,
                    ]);

                    done();
                });
        });
        it('should support pagination', (done) => {
            request(server)
                .get('/api/dataPasses?page[offset]=1&sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: dataPasses } = res.body;
                    expect(dataPasses).to.be.an('array');
                    expect(dataPasses).to.have.ordered.deep.members([
                        LHC22b_apass2,
                        LHC22b_apass1,
                    ]);

                    done();
                });
        });
        it('should return 400 when bad query paramter provided', (done) => {
            request(server)
                .get('/api/dataPasses?a=1')
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
                .get('/api/dataPasses?page[limit]=0')
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
                .get('/api/dataPasses?page[limit]=0')
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

    describe('POST /api/dataPasses/gaqDetectors', () => {
        it('should succesfuly set GAQ detectors', async () => {
            const dataPassId = 3;
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const response = await request(server).post(`/api/dataPasses/gaqDetectors?token=${BkpRoles.GAQ}`).send({
                dataPassId,
                runNumbers,
                dplDetectorIds: detectorIds,
            });
            expect(response.status).to.be.equal(201);
            expect(response.body.data).to.have.all.deep.members(runNumbers
                .flatMap((runNumber) => detectorIds.map((detectorId) => ({ dataPassId, runNumber, detectorId }))));
        });

        it('should fail to set GAQ detectors because of insufficient permission', async () => {
            const dataPassId = 3;
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const response = await request(server).post(`/api/dataPasses/gaqDetectors?token=${BkpRoles.GUEST}`).send({
                dataPassId,
                runNumbers,
                dplDetectorIds: detectorIds,
            });
            expect(response.status).to.be.equal(403);

            const { errors } = response.body;
            expect(errors.find(({ title }) => title === 'Access denied')).to.not.be.null;
        });
    });

    describe('GET /api/dataPasses/gaqDetectors', () => {
        it('should return 200 with the list of GAQ detectors', async () => {
            const response = await request(server).get('/api/dataPasses/gaqDetectors?dataPassId=3&runNumber=56');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.all.deep.members([
                { id: 7, name: 'FT0', type: DetectorType.PHYSICAL },
                { id: 4, name: 'ITS', type: DetectorType.PHYSICAL },
            ]);
        });
    });
};
