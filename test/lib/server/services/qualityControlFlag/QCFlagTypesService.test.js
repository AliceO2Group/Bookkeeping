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
const { qcFlagTypesService } = require('../../../../../lib/server/services/qualityControlFlag/QCFlagTypesService');
const assert = require('assert');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError');
const { expectObjectToBeSuperset } = require('../../../../utilities/expectObjectToBeSuperset');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError');

module.exports = () => {
    describe('Fetching quality control flags types', () => {
        it ('should successfuly fetch QC Flag Type by id', async () => {
            const qcFlagType = await qcFlagTypesService.getByIdentifier({ id: 2 });
            delete qcFlagType.createdAt;
            delete qcFlagType.updatedAt;
            expect(qcFlagType).to.be.eql({
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
            });
        });

        it ('should return null when there is no QC Flag type with given id ', async () => {
            const qcFlagType = await qcFlagTypesService.getByIdentifier({ id: 9999 });
            expect(qcFlagType).to.be.eql(null);
        });

        it ('should successfuly fetch QC Flag Type by name', async () => {
            const qcFlagType = await qcFlagTypesService.getByIdentifier({ name: 'CertifiedByExpert' });
            delete qcFlagType.createdAt;
            delete qcFlagType.updatedAt;
            expect(qcFlagType).to.be.eql({
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
            });
        });

        it ('should reject when no QC Flag type with given id was found', async () => {
            await assert.rejects(
                () => qcFlagTypesService.getOneOrFail({ id: 99999 }),
                new NotFoundError('Quality Control Flag Type with this id (99999) could not be found'),
            );
        });

        it('should successfuly fetch quality control flags types', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll();
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
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
            ]);
        });

        it('should successfuly filter QC flags types by id', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ filter: { ids: [3, 11] } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ id }) => id)).to.have.all.members([3, 11]);
        });

        it('should successfuly filter QC flags types by name', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ filter: { names: ['UnknownQuality'] } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes[0].name).to.be.equal('UnknownQuality');
        });

        it('should successfuly filter QC flags types by name pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ filter: { names: { like: ['Bad'] } } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['Bad', 'BadPID']);
        });

        it('should successfuly filter QC flags types by method', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ filter: { methods: ['Limited acceptance'] } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes[0].name).to.be.equal('LimitedAcceptance');
        });

        it('should successfuly filter QC flags types by method pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ filter: { methods: { like: ['Bad'] } } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ method }) => method)).to.have.all.members(['Bad', 'Bad PID']);
        });

        it('should successfuly filter QC flags types by whether the flag is `bad`', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ filter: { bad: false } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['CertifiedByExpert']);
        });

        it('should successfuly sort by id', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ sort: { id: 'DESC' } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([13, 12, 11, 3, 2]);
        });

        it('should successfuly sort by name', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ sort: { name: 'DESC' } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes.map(({ name }) => name)).to.have.all.ordered.members([
                'UnknownQuality',
                'LimitedAcceptance',
                'CertifiedByExpert',
                'BadPID',
                'Bad',
            ]);
        });

        it('should successfuly sort by method', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ sort: { method: 'ASC' } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes.map(({ name }) => name)).to.have.all.ordered.members([
                'Bad',
                'BadPID',
                'CertifiedByExpert',
                'LimitedAcceptance',
                'UnknownQuality',
            ]);
        });

        it('should successfuly apply pagination', async () => {
            const { count, rows: flagTypes } = await qcFlagTypesService.getAll({ offset: 2, limit: 3, sort: { id: 'ASC' } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(3);
            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([11, 12, 13]);
        });
    });

    describe('Creating QC Flag Type', () => {
        it('should successfuly create QC Flag Type', async () => {
            const parameters = {
                name: 'A',
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
                externalUserId: 1,
            };
            const newQCFlag = await qcFlagTypesService.create(parameters);
            delete parameters.externalUserId;
            expectObjectToBeSuperset(newQCFlag, parameters);
        });

        it('should fail when no name is provided', async () => {
            const parameters = {
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
                externalUserId: 1,
            };
            await assert.rejects(() => qcFlagTypesService.create(parameters));
        });

        it('should fail when no method is provided', async () => {
            const parameters = {
                name: 'A',
                bad: false,
                color: '#FFAA00',
                externalUserId: 1,
            };
            await assert.rejects(() => qcFlagTypesService.create(parameters));
        });

        it('should fail when no bad is provided', async () => {
            const parameters = {
                name: 'A',
                method: 'AA+',
                color: '#FFAA00',
                externalUserId: 1,
            };
            await assert.rejects(() => qcFlagTypesService.create(parameters));
        });

        it('should fail when no user info is provided', async () => {
            const parameters = {
                name: 'A',
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
            };
            await assert.rejects(() => qcFlagTypesService.create(parameters));
        });
    });

    describe('Updating QC Flag Type', () => {
        it('should reject when existing name provided', () => {
            assert.rejects(
                () => qcFlagTypesService.update(12, { name: 'Bad', userId: 1 }),
                new ConflictError('name must be unique'),
            );
        });

        it('should reject when existing method provided', () => {
            assert.rejects(
                () => qcFlagTypesService.update(12, { method: 'Bad', userId: 1 }),
                new ConflictError('method must be unique'),
            );
        });

        it('should reject when bad color format provided', () => {
            assert.rejects(
                () => qcFlagTypesService.update(12, { color: '#qweras', userId: 1 }),
                new ConflictError('Incorrect format of the color provided (#qweras)'),
            );
        });

        it('should reject when no QC flag type to be updated found', () => {
            assert.rejects(() => qcFlagTypesService.update(99999, { color: '#aaaaaa', userId: 1 }));
        });

        it('should reject when no user is found', () => {
            assert.rejects(() => qcFlagTypesService.update(10, { color: '#aaaaaa', userId: 999 }));
        });

        it('should successfuly update one QC Flag Type', async () => {
            const patch = { name: 'VeryBad', method: 'Very Bad', color: '#ff0000' };
            const userId = 1;

            const updatedFlagType = await qcFlagTypesService.update(13, { ...patch, userId });
            const fetchedFlagType = await qcFlagTypesService.getOneOrFail({ id: 13 });

            expectObjectToBeSuperset(fetchedFlagType, { ...patch, lastUpdatedById: userId });
            expect(updatedFlagType).to.be.eql(fetchedFlagType);
        });
    });
};
