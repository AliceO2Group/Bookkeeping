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
const { qcFlagTypeService } = require('../../lib/server/services/qualityControlFlag/QcFlagTypeService.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/qcFlagTypes/:id', () => {
        it('should successfuly fetch one QC flag type', async () => {
            const response = await request(server).get('/api/qcFlagTypes/13');
            expect(response.status).to.be.equal(200);
            const { data: flagType } = response.body;
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
        });

        it('should send error that QC flag type with given id cannot be found', async () => {
            const response = await request(server).get('/api/qcFlagTypes/99999');
            expect(response.status).to.be.equal(404);
            const { errors } = response.body;
            expect(errors).to.be.eql([
                {
                    status: 404,
                    title: 'Not found',
                    detail: 'Quality Control Flag Type with this id (99999) could not be found',
                },
            ]);
        });
    });

    describe('GET /api/qcFlagTypes', () => {
        it('should successfuly fetch all qc flag types', async () => {
            const response = await request(server).get('/api/qcFlagTypes');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
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
        });

        it('should successfuly filter QC flag types by id', async () => {
            const response = await request(server).get('/api/qcFlagTypes?filter[ids][]=3');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 1, pageCount: 1 } });
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);

            expect(flagTypes.map(({ id }) => id)).to.have.all.deep.members([3]);
        });

        it('should successfuly filter QC flag types by names pattern', async () => {
            const response = await request(server).get('/api/qcFlagTypes?filter[names][]=Bad');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);

            expect(flagTypes.map(({ name }) => name)).to.have.all.deep.members(['Bad', 'BadPID']);
        });

        it('should successfuly filter QC flag types by names', async () => {
            const response = await request(server).get('/api/qcFlagTypes?filter[names][]=Bad&filter[names][]=LimitedAcceptance');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);

            expect(flagTypes.map(({ name }) => name)).to.have.all.deep.members(['Bad', 'LimitedAcceptance']);
        });

        it('should successfuly filter QC flag types by mathods pattern', async () => {
            const response = await request(server).get('/api/qcFlagTypes?filter[methods][]=Bad');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });

            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);

            expect(flagTypes.map(({ method }) => method)).to.have.all.deep.members(['Bad', 'Bad PID']);
        });

        it('should successfuly filter QC flag types by methods patterns', async () => {
            const response = await request(server).get('/api/qcFlagTypes?filter[methods][]=Bad');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });

            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);

            expect(flagTypes.map(({ method }) => method)).to.have.all.deep.members(['Bad', 'Bad PID']);
        });

        it('should successfuly filter QC flag types by whether the flag is `bad`', async () => {
            const response = await request(server).get('/api/qcFlagTypes?filter[bad]=false');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 2, pageCount: 1 } });

            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);

            expect(flagTypes.map(({ name }) => name)).to.have.all.deep.members(['CertifiedByExpert', 'Archived']);
        });

        it('should successfuly sort QC flag types by id', async () => {
            const response = await request(server).get('/api/qcFlagTypes?sort[id]=DESC');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 1 } });

            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(6);

            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([20, 13, 12, 11, 3, 2]);
        });

        it('should successfuly sort QC flag types by name', async () => {
            const response = await request(server).get('/api/qcFlagTypes?sort[name]=DESC');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
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
        });

        it('should successfuly sort QC flag types by method', async () => {
            const response = await request(server).get('/api/qcFlagTypes?sort[method]=ASC');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
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
        });

        it('should successfuly apply pagination of QC flag types', async () => {
            const response = await request(server).get('/api/qcFlagTypes?page[limit]=2&page[offset]=2&sort[id]=ASC');
            expect(response.status).to.be.equal(200);
            const { meta, data: flagTypes } = response.body;
            expect(meta).to.be.eql({ page: { totalCount: 6, pageCount: 3 } });

            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);

            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([11, 12]);
        });
    });

    describe('POST /api/qcFlagTypes', () => {
        it('should successfuly create QC Flag Type', async () => {
            const parameters = {
                name: 'A',
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
            };

            const response = await request(server).post('/api/qcFlagTypes?token=admin').send(parameters);
            expect(response.status).to.be.equal(201);
            const { data: newQCFlag } = response.body;
            {
                const { name, method, bad, color } = newQCFlag;
                expect({ name, method, bad, color }).to.be.eql(parameters);
            }
            {
                const fetchedQcFlagType = await qcFlagTypeService.getById(newQCFlag.id);
                const { name, method, bad, color } = fetchedQcFlagType;
                expect({ name, method, bad, color }).to.be.eql(parameters);
            }
        });

        it('should fail when no name is provided', async () => {
            const parameters = {
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
            };

            const response = await request(server).post('/api/qcFlagTypes?token=admin').send(parameters);
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/name');
            expect(titleError.detail).to.equal('"body.name" is required');
        });

        it('should fail when no method is provided', async () => {
            const parameters = {
                name: 'A',
                bad: false,
                color: '#FFAA00',
            };

            const response = await request(server).post('/api/qcFlagTypes?token=admin').send(parameters);
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/method');
            expect(titleError.detail).to.equal('"body.method" is required');
        });

        it('should fail when no bad info is provided', async () => {
            const parameters = {
                name: 'A',
                method: 'A++',
                color: '#FFAA00',
            };

            const response = await request(server).post('/api/qcFlagTypes?token=admin').send(parameters);
            expect(response.status).to.be.equal(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/bad');
            expect(titleError.detail).to.equal('"body.bad" is required');
        });
    });

    describe('PUT /api/qcFlagTypes/:id', () => {
        it('should reject when existing name provided', async () => {
            const qcFlagTypeId = 13;

            const patch = {
                name: 'BadPID',
            };
            const response = await request(server)
                .put(`/api/qcFlagTypes/${qcFlagTypeId}?token=admin`)
                .send(patch);
            expect(response.status).to.be.eql(409);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.title === 'The request conflicts with existing data');
            expect(titleError.detail).to.equal('A QC flag with name BadPID already exists');
        });

        it('should reject when existing method provided', async () => {
            const qcFlagTypeId = 13;

            const patch = {
                method: 'Bad PID',
            };
            const response = await request(server)
                .put(`/api/qcFlagTypes/${qcFlagTypeId}?token=admin`)
                .send(patch);
            expect(response.status).to.be.eql(409);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.title === 'The request conflicts with existing data');
            expect(titleError.detail).to.equal('A QC flag with method Bad PID already exists');
        });

        it('should reject when incorrect color provided', async () => {
            const qcFlagTypeId = 13;

            const patch = {
                color: '#aabbxx',
            };
            const response = await request(server)
                .put(`/api/qcFlagTypes/${qcFlagTypeId}?token=admin`)
                .send(patch);
            expect(response.status).to.be.eql(400);
            const { errors } = response.body;
            const titleError = errors.find((err) => err.title === 'Invalid Attribute');
            expect(titleError.detail).to.equal('"body.color" with value "#aabbxx" fails to match the required pattern: /#[0-9a-fA-F]{6}/');
        });

        it('should successfuly update one QC Flag Type', async () => {
            const patch = { name: 'VeryBad', method: 'Very Bad', color: '#ff0000' };
            const qcFlagTypeId = 13;

            const response = await request(server)
                .put(`/api/qcFlagTypes/${qcFlagTypeId}?token=admin`)
                .send(patch);
            console.log(response.body.errors)
            expect(response.status).to.be.eql(201);
            const { data: fetchedFlagType } = response.body;
            const { name, method, color } = fetchedFlagType;
            expect({ name, method, color }).to.be.eql(patch);
        });
    });
};
