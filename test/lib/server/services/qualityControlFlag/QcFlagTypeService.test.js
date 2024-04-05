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
const assert = require('assert');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError');
const { qcFlagTypeService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagTypeService');

module.exports = () => {
    describe('Fetching QC flags types by id', () => {
        it ('should successfuly fetch QC Flag Type by id', async () => {
            const qcFlagType = await qcFlagTypeService.getById(2);
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
            const qcFlagType = await qcFlagTypeService.getById(9999);
            expect(qcFlagType).to.be.eql(null);
        });

        it ('should reject when no QC Flag type with given id was found', async () => {
            await assert.rejects(
                () => qcFlagTypeService.getOneOrFail(99999),
                new NotFoundError('Quality Control Flag Type with this id (99999) could not be found'),
            );
        });
    });

    describe('fetching QC flag types', () => {
        it('should successfuly fetch quality control flags types', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll();
            expect(count).to.be.equal(6);
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

        it('should successfuly filter QC flags types by id', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { ids: [3, 11] } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ id }) => id)).to.have.all.members([3, 11]);
        });

        it('should successfuly filter QC flags types by name pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { names: ['UnknownQuality'] } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes[0].name).to.be.equal('UnknownQuality');
        });

        it('should successfuly filter QC flags types by name', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { names: ['UnknownQuality', 'LimitedAcceptance'] } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['UnknownQuality', 'LimitedAcceptance']);
        });

        it('should successfuly filter QC flags types by namfalsee pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { names: ['Bad'] } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['Bad', 'BadPID']);
        });

        it('should successfuly filter QC flags types by method pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { methods: ['Limited acceptance'] } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes[0].name).to.be.equal('LimitedAcceptance');
        });

        it('should successfuly filter QC flags types by method pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { methods: ['Bad'] } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ method }) => method)).to.have.all.members(['Bad', 'Bad PID']);
        });

        it('should successfuly filter QC flags types by whether the flag is `bad`', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { bad: false } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['CertifiedByExpert', 'Archived']);
        });

        it('should successfuly filter QC flags types by archived', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { archived: true } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['Archived']);
        });

        it('should successfuly filter QC flags types by archived - 2', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { archived: false } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes.filter(({ name }) => name === 'Archived')).to.be.lengthOf(0);
        });

        it('should successfuly sort by id', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ sort: { id: 'DESC' } });
            expect(count).to.be.equal(6);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(6);
            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([20, 13, 12, 11, 3, 2]);
        });

        it('should successfuly sort by name', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ sort: { name: 'DESC' } });
            expect(count).to.be.equal(6);
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

        it('should successfuly sort by method', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ sort: { method: 'ASC' } });
            expect(count).to.be.equal(6);
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

        it('should successfuly apply pagination', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ offset: 2, limit: 3, sort: { id: 'ASC' } });
            expect(count).to.be.equal(6);
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
            };
            const relations = { user: { externalUserId: 1 } };
            const newQCFlag = await qcFlagTypeService.create(parameters, relations);
            {
                const { name, method, bad, color, createdBy: { externalId: externalUserId } } = newQCFlag;
                expect({ name, method, bad, color, externalUserId }).to.be.eql({ ...parameters, ...relations.user });
            }
            {
                const fetchedQCFlag = await qcFlagTypeService.getById(newQCFlag.id);
                const { name, method, bad, color, createdBy: { externalId: externalUserId } } = fetchedQCFlag;
                expect({ name, method, bad, color, externalUserId }).to.be.eql({ ...parameters, ...relations.user });
            }
        });

        it('should fail when QC Flag type with provided name already exists', async () => {
            const parameters = {
                name: 'BadPID',
                method: 'Bad PID',
                bad: false,
            };
            await assert.rejects(
                () => qcFlagTypeService.create(parameters, { user: { externalUserId: 1 } }),
                new ConflictError(`A QC flag with name ${parameters.name} or ${parameters.method} already exists`),
            );
        });

        it('should fail when no user info is provided', async () => {
            const parameters = {
                name: 'A',
                method: 'AA+',
                bad: false,
                color: '#FFAA00',
            };
            await assert.rejects(
                () => qcFlagTypeService.create(parameters, {}),
                new BadParameterError('Can not find without id or external id'),
            );
        });
    });

    describe('Updating QC Flag Type', () => {
        it('should reject when existing name provided', async () => {
            await assert.rejects(
                () => qcFlagTypeService.update(12, { name: 'Bad' }, { user: { userId: 1 } }),
                new ConflictError('A QC flag with name Bad already exists'),
            );
        });

        it('should reject when existing method provided', async () => {
            await assert.rejects(
                () => qcFlagTypeService.update(12, { method: 'Bad' }, { user: { userId: 1 } }),
                new ConflictError('A QC flag with method Bad already exists'),
            );
        });

        it('should reject when QC flag type with given is not found', async () => {
            await assert.rejects(
                () => qcFlagTypeService.update(99999, { color: '#aaaaaa' }, { user: { userId: 1 } }),
                new NotFoundError('Quality Control Flag Type with this id (99999) could not be found'),
            );
        });

        it('should reject when no user is found', async () => {
            await assert.rejects(
                () => qcFlagTypeService.update(10, { color: '#aaaaaa' }, { user: { userId: 999 } }),
                new NotFoundError('User with this id (999) could not be found'),
            );
        });

        it('should successfuly update one QC Flag Type', async () => {
            const patch = { name: 'VeryBad', method: 'Very Bad', color: '#ff0000' };
            const userId = 1;

            const updatedFlagType = await qcFlagTypeService.update(13, patch, { user: { userId } });
            const fetchedFlagType = await qcFlagTypeService.getOneOrFail(13);
            const { name, method, color, lastUpdatedBy: { id: lastUpdatedById } } = fetchedFlagType;
            expect({ name, method, color, lastUpdatedById }).to.be.eql({ ...patch, lastUpdatedById: userId });
            expect(updatedFlagType).to.be.eql(fetchedFlagType);
        });

        it('should successfuly archive QC Flag Type', async () => {
            const patch = { archived: true };
            const userId = 1;

            const updatedFlagType = await qcFlagTypeService.update(13, patch, { user: { userId } });
            const fetchedFlagType = await qcFlagTypeService.getOneOrFail(13);
            const { archived, lastUpdatedBy: { id: lastUpdatedById } } = fetchedFlagType;
            expect({ archived, lastUpdatedById }).to.be.eql({ ...patch, lastUpdatedById: userId });
            expect(updatedFlagType).to.be.eql(fetchedFlagType);
        });
    });
};
