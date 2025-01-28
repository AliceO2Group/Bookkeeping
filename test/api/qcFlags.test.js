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
const { repositories: { QcFlagRepository } } = require('../../lib/database');
const { expect } = require('chai');
const request = require('supertest');
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { qcFlagService } = require('../../lib/server/services/qualityControlFlag/QcFlagService');

module.exports = () => {
    before(resetDatabaseContent);
    describe('GET /api/qcFlags/:id', () => {
        it('should successfully fetch one QC flag', async () => {
            const response = await request(server).get('/api/qcFlags/4');
            expect(response.status).to.be.equal(200);
            const { data: qcFlag } = response.body;
            expect(qcFlag).to.be.eql({
                id: 4,
                from: new Date('2022-03-22 02:46:40').getTime(),
                to: new Date('2022-03-22 04:46:40').getTime(),
                comment: 'Some qc comment 4',
                origin: null,
                createdAt: new Date('2024-02-13 11:57:19').getTime(),
                updatedAt: new Date('2024-02-13 11:57:19').getTime(),
                runNumber: 1,
                dplDetectorId: 1,
                createdById: 2,
                verifications: [
                    {
                        id: 1,
                        comment: 'FLAG IS OK',
                        flagId: 4,
                        createdById: 1,
                        createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                        createdAt: new Date('2024-02-13 12:57:19').getTime(),
                    },
                ],

                createdBy: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagTypeId: 13,
                flagType: { id: 13, name: 'Bad', method: 'Bad', mcReproducible: false, bad: true, archived: false, color: null },
                effectivePeriods: [],
            });
        });

        it('should send error that QC flag with given id cannot be found', async () => {
            const response = await request(server).get('/api/qcFlags/99999');
            expect(response.status).to.be.equal(404);
            const { errors } = response.body;
            expect(errors).to.be.eql([
                {
                    status: 404,
                    title: 'Not found',
                    detail: 'Quality Control Flag with this id (99999) could not be found',
                },
            ]);
        });
    });

    describe('GET /api/qcFlags/summary', () => {
        it('should successfully get non-empty QC flag summary for data pass', async () => {
            const response = await request(server).get('/api/qcFlags/summary?dataPassId=1');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 3,
                        mcReproducible: true,
                        badEffectiveRunCoverage: 0.3333333,
                        explicitlyNotBadEffectiveRunCoverage: 0,
                    },
                    16: {
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        mcReproducible: false,
                        missingVerificationsCount: 1,
                    },
                },
            });
        });

        it('should successfully get non-empty QC flag summary with MC.Reproducible interpreted as not-bad for data pass', async () => {
            const response = await request(server).get('/api/qcFlags/summary?dataPassId=1&mcReproducibleAsNotBad=true');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 3,
                        mcReproducible: true,
                        badEffectiveRunCoverage: 0.1111111,
                        explicitlyNotBadEffectiveRunCoverage: 0.2222222,
                    },
                    16: {
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        mcReproducible: false,
                        missingVerificationsCount: 1,
                    },
                },
            });
        });

        it('should successfully get non-empty QC flag summary for simulation pass', async () => {
            const response = await request(server).get('/api/qcFlags/summary?simulationPassId=1');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 1,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0.7222222,
                        explicitlyNotBadEffectiveRunCoverage: 0,
                    },
                },
            });
        });

        it('should successfully get non-empty QC summary of synchronous flags for given LHC period', async () => {
            const response = await request(server).get('/api/qcFlags/summary?lhcPeriodId=1');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                56: {
                    // FT0
                    7: {
                        missingVerificationsCount: 1,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0.1666667,
                        explicitlyNotBadEffectiveRunCoverage: 0.8333333,
                    },

                    // ITS
                    4: {
                        missingVerificationsCount: 1,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                    },
                },
            });
        });

        it('should return 400 when bad query parameter provided', async () => {
            {
                const response = await request(server).get('/api/qcFlags/summary');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query');
                expect(titleError.detail).to.equal('"query" must contain at least one of [dataPassId, simulationPassId, lhcPeriodId]');
            }
            {
                const response = await request(server).get('/api/qcFlags/summary?simulationPassId=1&dataPassId=1');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query');
                expect(titleError.detail).to
                    .equal('"query" contains a conflict between exclusive peers [dataPassId, simulationPassId, lhcPeriodId]');
            }
        });
    });

    describe('GET /api/qcFlags/summary/gaq', () => {
        it('should successfully get non-empty GAQ summary for data pass', async () => {
            const relations = { user: { roles: ['admin'], externalUserId: 456 } };
            const limitedAccMCTypeId = 5;
            const itsId = 4;
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: limitedAccMCTypeId }],
                { runNumber: 54, dataPassIdentifier: { id: 3 }, detectorIdentifier: { detectorId: itsId } },
                relations,
            );

            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=3');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                54: {
                    missingVerificationsCount: 1,
                    mcReproducible: true,
                    badEffectiveRunCoverage: 1,
                    explicitlyNotBadEffectiveRunCoverage: 0,
                },
                56: {
                    badEffectiveRunCoverage: 1,
                    explicitlyNotBadEffectiveRunCoverage: 0,
                    mcReproducible: true,
                    missingVerificationsCount: 4,
                },
            });
        });

        it('should return 400 when bad query parameter provided', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq');
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/dataPassId');
            expect(titleError.detail).to.equal('"query.dataPassId" is required');
        });
    });

    describe('GET /api/qcFlags/perDataPass and /api/qcFlags/perSimulationPass', () => {
        it('should successfully fetch QC flags for data pass', async () => {
            const response = await request(server)
                .get('/api/qcFlags/perDataPass?dataPassId=1&runNumber=106&dplDetectorId=1');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 3, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(3);
            expect(data.map(({ qcFlagId }) => qcFlagId)).to.have.all.members([1, 2, 3]);
        });

        it('should successfully fetch QC flags for simulation pass', async () => {
            const response = await request(server)
                .get('/api/qcFlags/perSimulationPass?simulationPassId=1&runNumber=106&dplDetectorId=1');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(2);
            expect(data[0].qcFlagId).to.be.equal(6);
        });

        it('should support pagination', async () => {
            const response = await request(server)
                .get('/api/qcFlags/perDataPass?dataPassId=1&runNumber=106&dplDetectorId=1&page[offset]=1&page[limit]=2');
            expect(response.status).to.be.equal(200);
            const { data: qcFlags } = response.body;
            expect(qcFlags).to.be.an('array');
            expect(qcFlags.map(({ qcFlagId }) => qcFlagId)).to.have.ordered.deep.members([2, 1]);
        });
        it('should return 400 when bad query parameter provided', async () => {
            {
                const response = await request(server).get('/api/qcFlags/perDataPass?a=1');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/a');
                expect(titleError.detail).to.equal('"query.a" is not allowed');
            }
            {
                const response = await request(server).get('/api/qcFlags/perSimulationPass?a=1');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/a');
                expect(titleError.detail).to.equal('"query.a" is not allowed');
            }
        });
        it('should return 400 if the limit is below 1', async () => {
            {
                const response = await request(server)
                    .get('/api/qcFlags/perDataPass?dataPassId=1&runNumber=106&dplDetectorId=1&page[offset]=1&page[limit]=0');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
                expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
            }
        });
    });

    describe('GET /api/qcFlags/synchronous', () => {
        it('should successfully fetch synchronous flags', async () => {
            const runNumber = 56;
            const detectorId = 7;
            const response = await request(server).get(`/api/qcFlags/synchronous?runNumber=${runNumber}&detectorId=${detectorId}`);
            expect(response.status).to.be.equal(200);
            const { data: flags, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });
            expect(flags.map(({ id }) => id)).to.have.all.ordered.members([101, 100]);
        });

        it('should successfully fetch synchronous flags with pagination', async () => {
            const runNumber = 56;
            const detectorId = 7;
            {
                const response = await request(server)
                    .get(`/api/qcFlags/synchronous?runNumber=${runNumber}&detectorId=${detectorId}&page[limit]=1&page[offset]=1`);

                expect(response.status).to.be.equal(200);
                const { data: flags, meta } = response.body;
                expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 2 } });
                expect(flags).to.be.lengthOf(1);
                const [flag] = flags;
                expect(flag.id).to.be.equal(100);
                expect(flag.verifications[0].comment).to.be.equal('good');
            }
        });
    });

    describe('POST /api/qcFlags', () => {
        it('should successfully create QC flag instance for data pass', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const response = await request(server).post('/api/qcFlags?token=admin').send(qcFlagCreationParameters);
            expect(response.status).to.be.equal(201);
            const [createdQcFlag] = response.body.data;

            const { dataPassId, ...expectedProperties } = qcFlagCreationParameters;
            {
                const { from, to, comment, flagTypeId, runNumber, dplDetectorId } = createdQcFlag;
                expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql(expectedProperties);
            }
            {
                const { from, to, comment, flagTypeId, runNumber, detectorId: dplDetectorId, dataPasses } = await QcFlagRepository.findOne({
                    include: [{ association: 'dataPasses' }],
                    where: {
                        id: createdQcFlag.id,
                    },
                });
                expect({ from: from.getTime(), to: to.getTime(), comment, flagTypeId, runNumber, dplDetectorId }).to
                    .be.eql(expectedProperties);
                expect(dataPasses.map(({ id }) => id)).to.have.all.members([dataPassId]);
            }
        });

        it('should successfully create QC flag instance for data pass with GLO detector', async () => {
            const qcFlagCreationParameters = {
                from: null,
                to: null,
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 21,
            };

            const response = await request(server).post('/api/qcFlags?token=det-glo').send(qcFlagCreationParameters);
            expect(response.status).to.be.equal(201);
            const [createdQcFlag] = response.body.data;
            const { dataPassId } = qcFlagCreationParameters;
            {
                const { comment, flagTypeId, runNumber, dplDetectorId } = createdQcFlag;
                expect({ comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql({
                    comment: qcFlagCreationParameters.comment,
                    flagTypeId: qcFlagCreationParameters.flagTypeId,
                    runNumber: qcFlagCreationParameters.runNumber,
                    dplDetectorId: qcFlagCreationParameters.dplDetectorId,
                });
            }
            {
                const { comment, flagTypeId, runNumber, detectorId, dataPasses } = await QcFlagRepository.findOne({
                    include: [{ association: 'dataPasses' }],
                    where: {
                        id: createdQcFlag.id,
                    },
                });
                expect({ comment, flagTypeId, runNumber, detectorId }).to.be.eql({
                    comment: qcFlagCreationParameters.comment,
                    flagTypeId: qcFlagCreationParameters.flagTypeId,
                    runNumber: qcFlagCreationParameters.runNumber,
                    detectorId: qcFlagCreationParameters.dplDetectorId,
                });
                expect(dataPasses.map(({ id }) => id)).to.have.all.members([dataPassId]);
            }
        });

        it('should successfully create QC flag instance for simulation pass', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const response = await request(server).post('/api/qcFlags?token=det-cpv').send(qcFlagCreationParameters);
            expect(response.status).to.be.equal(201);
            const [createdQcFlag] = response.body.data;
            const { simulationPassId, ...expectedProperties } = qcFlagCreationParameters;
            {
                const { from, to, comment, flagTypeId, runNumber, dplDetectorId } = createdQcFlag;
                expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql(expectedProperties);
            }
            {
                const { from, to, comment, flagTypeId, runNumber, detectorId: dplDetectorId, simulationPasses }
                    = await QcFlagRepository.findOne({
                        include: [{ association: 'simulationPasses' }],
                        where: {
                            id: createdQcFlag.id,
                        },
                    });
                expect({ from: from.getTime(), to: to.getTime(), comment, flagTypeId, runNumber, dplDetectorId }).to
                    .be.eql(expectedProperties);
                expect(simulationPasses.map(({ id }) => id)).to.have.all.members([simulationPassId]);
            }
        });

        it('should successfully create multiple QC flag instances for data pass', async () => {
            const qcFlagCreationParameters = {
                from: 1565294400001,
                to: 1565297000000,
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
                dataPassId: 5,
                runDetectors: [{ runNumber: 56, detectorIds: [4] }, { runNumber: 49, detectorIds: [4, 7] }],
            };
            const response = await request(server).post('/api/qcFlags?token=admin').send(qcFlagCreationParameters);
            expect(response.status).to.be.equal(201);
            const { data: createdQcFlags } = response.body;
            expect(createdQcFlags).to.be.lengthOf(3);
            const createdFlagsShared = createdQcFlags.map(({ from, to, comment, flagTypeId }) => ({ from, to, comment, flagTypeId }));
            expect(createdFlagsShared).to.be.eql(Array(3).fill({
                from: qcFlagCreationParameters.from,
                to: qcFlagCreationParameters.to,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: qcFlagCreationParameters.flagTypeId,
            }));
            expect(createdQcFlags.filter(({ runNumber }) => runNumber === 56).length).to.be.equal(1);
            expect(createdQcFlags.filter(({ runNumber }) => runNumber === 49).length).to.be.equal(2);
            expect(createdQcFlags.find(({ runNumber, dplDetectorId }) => runNumber === 49 && dplDetectorId === 4)).to.exist;
            expect(createdQcFlags.find(({ runNumber, dplDetectorId }) => runNumber === 49 && dplDetectorId === 7)).to.exist;
            expect(createdQcFlags.find(({ runNumber, dplDetectorId }) => runNumber === 56 && dplDetectorId === 4)).to.exist;
        });

        it('should fail to create QC flag instance when runDetectors and runNumber or dplDetectorId are specified', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
                runDetectors: [
                    {
                        runNumber: 106,
                        detectorIds: [1],
                    },
                ],
            };
            const response = await request(server).post('/api/qcFlags?token=admin').send(qcFlagCreationParameters);
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            expect(errors).to.be.eql([
                {
                    status: '422',
                    source: {
                        pointer: '/data/attributes/body/runNumber',
                    },
                    title: 'Invalid Attribute',
                    detail: 'runNumber is not allowed when runDetectors is provided.',
                },
                {
                    status: '422',
                    source: {
                        pointer: '/data/attributes/body/dplDetectorId',
                    },
                    title: 'Invalid Attribute',
                    detail: 'dplDetectorId is not allowed when runDetectors is provided.',
                },
            ]);
        });

        it('should fail to create QC flag instance when dataPass and simulation are both specified', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const response = await request(server).post('/api/qcFlags?token=admin').send(qcFlagCreationParameters);
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            expect(errors).to.be.eql([
                {
                    status: '422',
                    source: {
                        pointer: '/data/attributes/body',
                    },
                    title: 'Invalid Attribute',
                    detail: '"body" contains a conflict between exclusive peers [dataPassId, simulationPassId]',
                },
            ]);
        });
    });

    describe('DELETE /api/qcFlags/:id', () => {
        it('should fail to delete QC flag which is verified', async () => {
            const id = 4;
            const response = await request(server).delete(`/api/qcFlags/${id}?token=admin`);
            expect(response.status).to.be.equal(409);
            const { errors } = response.body;
            expect(errors).to.be.eql([
                {
                    status: 409,
                    title: 'The request conflicts with existing data',
                    detail: 'Cannot delete QC flag which is verified',
                },
            ]);
        });
        it('should fail to delete QC flag when not being admin', async () => {
            const id = 5;
            const response = await request(server).delete(`/api/qcFlags/${id}`);
            expect(response.status).to.be.equal(403);
            const { errors } = response.body;
            expect(errors).to.be.eql([
                {
                    status: '403',
                    title: 'Access denied',
                },
            ]);
        });
        it('should successfully delete QC flag as admin', async () => {
            const id = 2;
            const response = await request(server).delete(`/api/qcFlags/${id}?token=admin`);

            expect(response.status).to.be.equal(200);
            expect(response.body.data.id).to.be.equal(id);
        });
    });

    describe('POST /api/qcFlags/:id/verify', () => {
        it('should successfully verify QC flag when not being owner', async () => {
            const flagId = 5;
            const comment = 'Ok, VERIFIED';

            const response = await request(server).post(`/api/qcFlags/${flagId}/verify?token=det-cpv`).send({ comment });
            expect(response.status).to.be.equal(201);
            const { body: { data: verifiedFlag } } = response;
            {
                const { verifications } = verifiedFlag;
                const [{ createdBy, createdById, comment, flagId }] = verifications;
                expect({ flagId, comment, createdById, createdBy }).to.be.eql({
                    flagId: 5,
                    createdById: 1,
                    createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                    comment: 'Ok, VERIFIED',
                });
            }
            {
                const fetchedQcFlag = await qcFlagService.getById(flagId);
                expect(fetchedQcFlag).to.be.eql(verifiedFlag);
            }
        });
    });
};
