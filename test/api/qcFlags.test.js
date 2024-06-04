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
        it('should successfuly fetch one QC flag', async () => {
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
                flagType: { id: 13, name: 'Bad', method: 'Bad', bad: true, archived: false, color: null },
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
        it('should succsessfully get non-empty QC flag summary for data pass', async () => {
            const response = await request(server).get('/api/qcFlags/summary?dataPassId=1');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 3,
                        badEffectiveRunCoverage: 0.8376,
                    },
                },
            });
        });

        it('should succsessfully get non-empty QC flag summary for simulation pass', async () => {
            const response = await request(server).get('/api/qcFlags/summary?simulationPassId=1');
            expect(response.status).to.be.equal(200);
            const { body: { data } } = response;
            expect(data).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 1,
                        badEffectiveRunCoverage: 0.9310,
                    },
                },
            });
        });

        it('should return 400 when bad query paramter provided', async () => {
            {
                const response = await request(server).get('/api/qcFlags/summary');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query');
                expect(titleError.detail).to.equal('"query" must contain at least one of [dataPassId, simulationPassId]');
            }
            {
                const response = await request(server).get('/api/qcFlags/summary?simulationPassId=1&dataPassId=1');
                expect(response.status).to.be.equal(400);
                const { errors } = response.body;
                const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query');
                expect(titleError.detail).to.equal('"query" contains a conflict between exclusive peers [dataPassId, simulationPassId]');
            }
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
        it('should return 400 when bad query paramter provided', async () => {
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

    describe('POST /api/qcFlags', () => {
        it('should successfuly create QC flag instance for data pass', async () => {
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
            const { data: createdQcFlag } = response.body;
            const { dataPassId, ...expectedProperties } = qcFlagCreationParameters;
            {
                const { from, to, comment, flagTypeId, runNumber, dplDetectorId } = createdQcFlag;
                expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql(expectedProperties);
            }
            {
                const { from, to, comment, flagTypeId, runNumber, dplDetectorId, dataPasses } = await QcFlagRepository.findOne({
                    include: [{ association: 'dataPasses' }],
                    where: {
                        id: createdQcFlag.id,
                    },
                });
                expect({ from: from.getTime(), to: to.getTime(), comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql(expectedProperties);
                expect(dataPasses.map(({ id }) => id)).to.have.all.members([dataPassId]);
            }
        });

        it('should successfuly create QC flag instance for data pass with GLO detector', async () => {
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
            const { data: createdQcFlag } = response.body;
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
                const { comment, flagTypeId, runNumber, dplDetectorId, dataPasses } = await QcFlagRepository.findOne({
                    include: [{ association: 'dataPasses' }],
                    where: {
                        id: createdQcFlag.id,
                    },
                });
                expect({ comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql({
                    comment: qcFlagCreationParameters.comment,
                    flagTypeId: qcFlagCreationParameters.flagTypeId,
                    runNumber: qcFlagCreationParameters.runNumber,
                    dplDetectorId: qcFlagCreationParameters.dplDetectorId,
                });
                expect(dataPasses.map(({ id }) => id)).to.have.all.members([dataPassId]);
            }
        });

        it('should successfuly create QC flag instance for simulation pass', async () => {
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
            const { data: createdQcFlag } = response.body;
            const { simulationPassId, ...expectedProperties } = qcFlagCreationParameters;
            {
                const { from, to, comment, flagTypeId, runNumber, dplDetectorId } = createdQcFlag;
                expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql(expectedProperties);
            }
            {
                const { from, to, comment, flagTypeId, runNumber, dplDetectorId, simulationPasses } = await QcFlagRepository.findOne({
                    include: [{ association: 'simulationPasses' }],
                    where: {
                        id: createdQcFlag.id,
                    },
                });
                expect({ from: from.getTime(), to: to.getTime(), comment, flagTypeId, runNumber, dplDetectorId }).to.be.eql(expectedProperties);
                expect(simulationPasses.map(({ id }) => id)).to.have.all.members([simulationPassId]);
            }
        });

        it('should fail to create QC flag instance when dataPass and simualtion are both specified', async () => {
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
        it('should succesfuly delete QC flag as admin', async () => {
            const id = 2;
            const response = await request(server).delete(`/api/qcFlags/${id}?token=admin`);

            expect(response.status).to.be.equal(200);
            expect(response.body.data.id).to.be.equal(id);
        });
    });

    describe('POST /api/qcFlags/:id/verify', () => {
        it('should succesfuly verify QC flag when not being owner', async () => {
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
