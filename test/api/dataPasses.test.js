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
const { SkimmingStage } = require('../../lib/domain/enums/SkimmingStage');
const { DataPassRepository, RunRepository, DataPassVersionRepository, DataPassRunRepository } = require('../../lib/database/repositories');
const { dataPassService } = require('../../lib/server/services/dataPasses/DataPassService');
const { Op } = require('sequelize');
const { buildUrl } = require('../../lib/utilities/buildUrl.js');
const { BkpRoles } = require('../../lib/domain/enums/BkpRoles.js');

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    pdpBeamType: 'pp',
    skimmingStage: SkimmingStage.SKIMMABLE,
    isFrozen: false,
    versions: [
        {
            id: 1,
            dataPassId: 1,
            description: 'Some random desc',
            reconstructedEventsCount: 50948694,
            outputSize: 56875682112600,
            lastSeen: 108,
            statusHistory: [
                {
                    createdAt: 1704884400000,
                    dataPassVersionId: 1,
                    id: 1,
                    status: 'Running',
                },
                {
                    createdAt: 1704885060000,
                    dataPassVersionId: 1,
                    id: 2,
                    status: 'Deleted',
                },
            ],
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/dataPasses', () => {
        it('should successfully fetch all data', (done) => {
            request(server)
                .get('/api/dataPasses')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data, meta } = res.body;
                    expect(meta).to.be.eql({ page: { totalCount: 5, pageCount: 1 } });
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(5);

                    done();
                });
        });
        it('should successfully filter on ids', (done) => {
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
        it('should successfully filter on names', (done) => {
            request(server)
                .get('/api/dataPasses?filter[names][]=LHC22b_apass2_skimmed')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0].name).to.be.eql('LHC22b_apass2_skimmed');

                    done();
                });
        });
        it('should retrieve no records when filtering on ids', (done) => {
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
        it('should retrieve no records when filtering on names', (done) => {
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
        it('should successfully filter on ids given as array', (done) => {
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
        it('should successfully filter on lhcPeriodIds', (done) => {
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
                    expect(dataPasses).to.be.lengthOf(3);
                    expect(dataPasses.map(({ name }) => name)).to.have.members(['LHC22b_apass1', 'LHC22b_skimming', 'LHC22b_apass2_skimmed']);
                    done();
                });
        });
        it('should successfully filter on simulationPassIds', (done) => {
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
                    expect(dataPasses.map(({ name }) => name)).to.have.all.deep.members(['LHC22b_apass1', 'LHC22b_apass2_skimmed']);
                    done();
                });
        });
        it('should successfully sort on id and name', (done) => {
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
                    expect(dataPasses).to.be.lengthOf(5);
                    expect(dataPasses.map(({ name }) => name)).to.have.ordered.members([
                        'LHC22b_apass2_skimmed',
                        'LHC22a_apass2',
                        'LHC22a_apass1',
                        'LHC22b_skimming',
                        'LHC22b_apass1',
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
                    expect(dataPasses.map(({ name }) => name)).to.have.ordered.deep.members([
                        'LHC22a_apass2',
                        'LHC22a_apass1',
                        'LHC22b_skimming',
                        'LHC22b_apass1',
                    ]);

                    done();
                });
        });
        it('should return 400 when bad query parameter provided', (done) => {
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

    describe('PATCH /api/dataPasses/skimming/markSkimmable', () => {
        it('should successfully mark data pass as skimmable', async () => {
            let newDataPass = await DataPassRepository.insert({ name: 'LHC22b_apass2', lhcPeriodId: 2 });
            const run = await RunRepository.findOne({ where: { runNumber: 106 } });
            await newDataPass.addRun(run);
            await DataPassVersionRepository.insert({ dataPassId: newDataPass.id, description: 'desc for LHC22b apass2' });

            let previousSkimmable = await DataPassRepository.findOne({ where: { name: 'LHC22b_apass1' } });
            expect(previousSkimmable.skimmingStage).to.be.equal(SkimmingStage.SKIMMABLE);

            const response = await request(server).patch(`/api/dataPasses/skimming/markSkimmable?dataPassId=${newDataPass.id}`);
            expect(response.status).to.be.equal(204);

            previousSkimmable = await DataPassRepository.findOne({ where: { name: 'LHC22b_apass1' } });
            expect(previousSkimmable.skimmingStage).to.be.equal(null);

            newDataPass = await DataPassRepository.findOne({ where: { name: 'LHC22b_apass2' } });
            expect(newDataPass.skimmingStage).to.be.equal(SkimmingStage.SKIMMABLE);

            // Restore skimmable runs flags after changing skimmable data pass
            await dataPassService.markAsSkimmable({ name: 'LHC22b_apass1' });
            await DataPassRunRepository.updateAll(
                { readyForSkimming: true },
                { where: { dataPassId: previousSkimmable.id, runNumber: 106 } },
            );
            await DataPassRunRepository.updateAll(
                { readyForSkimming: false },
                { where: { dataPassId: previousSkimmable.id, runNumber: { [Op.in]: [107, 108] } } },
            );
        });
    });

    describe('GET /api/dataPasses/skimming/runs', async () => {
        it('should successfully fetch runs list with ready_for_skimming information', async () => {
            const response = await request(server).get('/api/dataPasses/skimming/runs?dataPassId=1');
            const { data } = response.body;
            expect(data).to.have.all.deep.members([
                { runNumber: 106, readyForSkimming: true },
                { runNumber: 107, readyForSkimming: false },
                { runNumber: 108, readyForSkimming: false },
            ]);
        });
    });

    describe('PUT /api/dataPasses/skimming/runs', async () => {
        it('should successfully update runs with ready_for_skimming information', async () => {
            const newData = [
                { runNumber: 106, readyForSkimming: false },
                { runNumber: 107, readyForSkimming: true },
            ];

            const response = await request(server).put('/api/dataPasses/skimming/runs?dataPassId=1').send({ data: newData });
            const { data } = response.body;
            expect(data).to.have.all.deep.members(newData);

            expect(await dataPassService.getSkimmableRuns({ id: 1 })).to.have.all.deep.members([
                ...newData,
                { runNumber: 108, readyForSkimming: false },
            ]);
        });
    });

    describe('PATCH /api/dataPasses/freeze', async () => {
        it('should successfully freeze a given data pass', async () => {
            const dataPassId = 1;
            const response = await request(server).patch(buildUrl(
                '/api/dataPasses/freeze',
                { dataPassId, token: BkpRoles.DPG_ASYNC_QC_ADMIN },
            )).send({});
            expect(response.status).to.be.equal(204);

            const { isFrozen } = await dataPassService.getByIdentifier({ id: dataPassId });
            expect(isFrozen).to.be.true;
        });
    });

    describe('PATCH /api/dataPasses/freeze', async () => {
        it('should successfully unfreeze a given data pass', async () => {
            const dataPassId = 1;
            const response = await request(server).patch(buildUrl(
                '/api/dataPasses/unfreeze',
                { dataPassId, token: BkpRoles.DPG_ASYNC_QC_ADMIN },
            )).send({});
            expect(response.status).to.be.equal(204);

            const { isFrozen } = await dataPassService.getByIdentifier({ id: dataPassId });
            expect(isFrozen).to.be.false;
        });
    });
};
