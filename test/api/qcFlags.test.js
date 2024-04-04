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

    describe('GET /api/qcFlags', () => {
        it('should successfuly fetch all data', async () => {
            const response = await request(server).get('/api/qcFlags');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 5, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(5);
            expect(data).to.include.deep.members([
                {
                    id: 4,
                    from: (1647914400 + 10000) * 1000,
                    to: (1647914400 + 10000) * 1000,
                    comment: 'Some qc comment 4',
                    createdAt: 1707825439000,
                    updatedAt: 1707825439000,
                    runNumber: 1,
                    dplDetectorId: 1,
                    createdById: 2,
                    user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                    flagTypeId: 13,
                    flagType: { id: 13, name: 'Bad', method: 'Bad', bad: true, archived: false, color: null },
                },
            ]);
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
                .get('/api/qcFlags/?filter[dataPassIds][]=1&filter[runNumbers][]=106&filter[dplDetectorIds][]=1');
            expect(response.status).to.be.equal(200);
            const { data, meta } = response``.body;
            expect(meta).to.be.eql({ page: { totalCount: 3, pageCount: 1 } });
            expect(data).to.be.an('array');
            expect(data).to.be.lengthOf(3);
            expect(data.map(({ id }) => id)).to.have.all.members([1, 2, 3]);
        });
        it('should retrive no records when filtering on ids', async () => {
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
        it('should return 400 if the limit is below 1', async () => {
            const response = request(server).get('/api/qcFlags?page[limit]=0');
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/query/page/limit');
            expect(titleError.detail).to.equal('"query.page.limit" must be greater than or equal to 1');
        });
    });
};
