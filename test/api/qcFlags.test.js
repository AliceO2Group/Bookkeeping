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

module.exports = () => {
    before(resetDatabaseContent);
    describe('GET /api/qcFlags/:id', () => {
        it('should successfuly fetch one QC flag', async () => {
            const response = await request(server).get('/api/qcFlags/4');
            expect(response.status).to.be.equal(200);
            const { data: qcFlag } = response.body;
            expect(qcFlag).to.be.eql({
                id: 4,
                from: new Date('2022-03-22 04:46:40').getTime(),
                to: new Date('2022-03-22 04:46:40').getTime(),
                comment: 'Some qc comment 4',
                createdAt: new Date('2024-02-13 11:57:19').getTime(),
                updatedAt: new Date('2024-02-13 11:57:19').getTime(),
                runNumber: 1,
                dplDetectorId: 1,
                createdById: 2,
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

    describe('GET /api/qcFlags', () => {
        it('should successfuly fetch all QC flags', async () => {
            const response = await request(server).get('/api/qcFlags');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 5, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(5);
            const oneFetchedFlag = data.find(({ id }) => id === 4);
            expect(oneFetchedFlag).to.be.eql({
                id: 4,
                from: new Date('2022-03-22 04:46:40').getTime(),
                to: new Date('2022-03-22 04:46:40').getTime(),
                comment: 'Some qc comment 4',
                createdAt: new Date('2024-02-13 11:57:19').getTime(),
                updatedAt: new Date('2024-02-13 11:57:19').getTime(),
                runNumber: 1,
                dplDetectorId: 1,
                createdById: 2,
                createdBy: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagTypeId: 13,
                flagType: { id: 13, name: 'Bad', method: 'Bad', bad: true, archived: false, color: null },
            });
            expect(data.map(({ id }) => id)).to.have.all.members([1, 2, 3, 4, 5]);
        });

        it('should successfuly filter on ids', async () => {
            const response = await request(server).get('/api/qcFlags?filter[ids][]=1');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 1, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(1);
            expect(data[0].id).to.be.equal(1);
        });
        it('should successfuly filter on dataPassIds, runNumbers, dplDetectorIds', async () => {
            const response = await request(server)
                .get('/api/qcFlags?filter[dataPassIds][]=1&filter[runNumbers][]=106&filter[dplDetectorIds][]=1');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 3, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(3);
            expect(data.map(({ id }) => id)).to.have.all.members([1, 2, 3]);
        });

        it('should successfuly filter on simulationPassIds, runNumbers, dplDetectorIds', async () => {
            const response = await request(server)
                .get('/api/qcFlags?filter[simulationPassIds][]=1&filter[runNumbers][]=106&filter[dplDetectorIds][]=1');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 1, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(1);
            expect(data[0].id).to.be.equal(5);
        });

        it('should retrive no records when filtering on non-existing ids', async () => {
            const response = await request(server).get('/api/qcFlags?filter[ids][]=9999');
            expect(response.status).to.be.equal(200);
            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(0);
        });
        it('should successfuly filter on createdBy', async () => {
            const response = await request(server).get('/api/qcFlags?filter[createdBy][]=John%20Doe');
            expect(response.status).to.be.equal(200);
            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(3);
            expect(data.map(({ id }) => id)).to.have.all.members([1, 2, 3]);
        });
        it('should support sorting by id', async () => {
            const response = await request(server).get('/api/qcFlags?sort[id]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ id }) => id);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        // Sorting in ASC order
        it('should support sorting by `from` property', async () => {
            const response = await request(server).get('/api/qcFlags?sort[from]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ from }) => from);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should support sorting by `to` property', async () => {
            const response = await request(server).get('/api/qcFlags?sort[to]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ to }) => to);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should support sorting by flag type name', async () => {
            const response = await request(server).get('/api/qcFlags?sort[flagType]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ flagType: { name } }) => name);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should support sorting by createdBy name', async () => {
            const response = await request(server).get('/api/qcFlags?sort[createdBy]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ createdBy: { name } }) => name);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should support sorting by createdAt', async () => {
            const response = await request(server).get('/api/qcFlags?sort[createdAt]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ createdAt }) => createdAt);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should support sorting by updatedAt', async () => {
            const response = await request(server).get('/api/qcFlags?sort[updatedAt]=ASC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ updatedAt }) => updatedAt);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        // Sorting in DESC order
        it('should support sorting by `from` property', async () => {
            const response = await request(server).get('/api/qcFlags?sort[from]=DESC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ from }) => from);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should support sorting by `to` property', async () => {
            const response = await request(server).get('/api/qcFlags?sort[to]=DESC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ to }) => to);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should support sorting by flag type name', async () => {
            const response = await request(server).get('/api/qcFlags?sort[flagType]=DESC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ flagType: { name } }) => name);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should support sorting by createdBy name', async () => {
            const response = await request(server).get('/api/qcFlags?sort[createdBy]=DESC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ createdBy: { name } }) => name);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should support sorting by createdAt', async () => {
            const response = await request(server).get('/api/qcFlags?sort[createdAt]=DESC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ createdAt }) => createdAt);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should support sorting by updatedAt', async () => {
            const response = await request(server).get('/api/qcFlags?sort[updatedAt]=DESC');
            const { data: flags, meta: { page: { totalCount: count } } } = response.body;
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ updatedAt }) => updatedAt);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should support pagination', async () => {
            const response = await request(server).get('/api/qcFlags?page[offset]=1&page[limit]=2&sort[id]=ASC');
            expect(response.status).to.be.equal(200);
            const { data: qcFlags } = response.body;
            expect(qcFlags).to.be.an('array');
            expect(qcFlags.map(({ id }) => id)).to.have.ordered.deep.members([2, 3]);
        });
        it('should return 400 when bad query paramter provided', async () => {
            const response = await request(server).get('/api/qcFlags?a=1');
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/a');
            expect(titleError.detail).to.equal('"query.a" is not allowed');
        });
        it('should return 400 if the limit is below 1', async () => {
            const response = await request(server).get('/api/qcFlags?page[limit]=0');
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
            expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
        });
    });

    describe('POST /api/qcFlags', () => {
        it('should successfuly create QC flag instance for data pass', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERSETING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const response = await request(server).post('/api/qcFlags').send(qcFlagCreationParameters);
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

        it('should successfuly create QC flag instance for simulation pass', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERSETING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const response = await request(server).post('/api/qcFlags').send(qcFlagCreationParameters);
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
                comment: 'VERY INTERSETING REMARK',
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const response = await request(server).post('/api/qcFlags').send(qcFlagCreationParameters);
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
};
