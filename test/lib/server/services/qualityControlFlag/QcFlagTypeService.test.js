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
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { ids: [3, 11] } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ id }) => id)).to.have.all.members([3, 11]);
        });

        it('should successfuly filter QC flags types by name', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { names: ['UnknownQuality'] } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes[0].name).to.be.equal('UnknownQuality');
        });

        it('should successfuly filter QC flags types by name pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { names: { like: ['Bad'] } } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['Bad', 'BadPID']);
        });

        it('should successfuly filter QC flags types by method', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { methods: ['Limited acceptance'] } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes[0].name).to.be.equal('LimitedAcceptance');
        });

        it('should successfuly filter QC flags types by method pattern', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { methods: { like: ['Bad'] } } });
            expect(count).to.be.equal(2);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(2);
            expect(flagTypes.map(({ method }) => method)).to.have.all.members(['Bad', 'Bad PID']);
        });

        it('should successfuly filter QC flags types by whether the flag is `bad`', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ filter: { bad: false } });
            expect(count).to.be.equal(1);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(1);
            expect(flagTypes.map(({ name }) => name)).to.have.all.members(['CertifiedByExpert']);
        });

        it('should successfuly sort by id', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ sort: { id: 'DESC' } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([13, 12, 11, 3, 2]);
        });

        it('should successfuly sort by name', async () => {
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ sort: { name: 'DESC' } });
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
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ sort: { method: 'ASC' } });
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
            const { count, rows: flagTypes } = await qcFlagTypeService.getAll({ offset: 2, limit: 3, sort: { id: 'ASC' } });
            expect(count).to.be.equal(5);
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(3);
            expect(flagTypes.map(({ id }) => id)).to.have.all.ordered.members([11, 12, 13]);
        });
    });
};
