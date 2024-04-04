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

const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { expect } = require('chai');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');

const qcFlagWithId1 = {
    id: 1,
    from: (1565314200 - 10000) * 1000,
    to: (1565314200 + 10000) * 1000,
    comment: 'Some qc comment 1',

    // Associations
    createdById: 1,
    flagTypeId: 11, // LimitedAcceptance
    runNumber: 106,
    dplDetectorId: 1, // CPV
    createdAt: 1707825436000,

    createdBy: {
        id: 1,
        name: 'John Doe',
        externalId: 1,
    },
    flagType: {
        id: 11,
        name: 'LimitedAcceptance',
        method: 'Limited acceptance',
        bad: true,
        color: '#FFFF00',
        archived: false,
    },
};

module.exports = () => {
    before(resetDatabaseContent);
    after(resetDatabaseContent);

    describe('Fetching quality control flags', () => {
        it('should successfully fetch quality control flag by id', async () => {
            const qcFlag = await qcFlagService.getOneOrFail(1);
            delete qcFlag.updatedAt;
            expect(qcFlag).to.be.eql(qcFlagWithId1);
        });

        it('should throw error when flag with given id cannot be found', async () => {
            await assert.rejects(
                () => qcFlagService.getOneOrFail(99999),
                new BadParameterError('Quality Control Flag with this id (99999) could not be found'),
            );
        });

        it('should succesfuly fetch all flags', async () => {
            const { rows: flags, count } = await qcFlagService.getAll();
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedQcFlagWithId1 = flags.find(({ id }) => id === 1);
            delete fetchedQcFlagWithId1.updatedAt;
            expect(fetchedQcFlagWithId1).to.be.eql(qcFlagWithId1);
            expect(flags.map(({ id }) => id)).to.have.all.members([1, 2, 3, 4, 5]);
        });

        it('should succesfuly fetch all flags filtering with associations', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                filter: {
                    dataPassIds: [1],
                    runNumbers: [106],
                    dplDetectorIds: [1],
                },
            });
            expect(count).to.be.equal(3);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(3);
            expect(flags.map(({ id }) => id)).to.have.all.members([1, 2, 3]);
        });

        it('should succesfuly fetch all flags filtering with associations - 2', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                filter: {
                    dataPassIds: [2],
                    runNumbers: [1],
                    dplDetectorIds: [1],
                },
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            const [fetchedFlag] = flags;
            delete fetchedFlag.updatedAt;
            expect(fetchedFlag).to.be.eql({
                id: 4,
                from: 1647924400000,
                to: 1647924400000,
                comment: 'Some qc comment 4',
                runNumber: 1,
                dplDetectorId: 1,
                createdById: 2,
                createdBy: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagTypeId: 13,
                flagType: { id: 13, name: 'Bad', method: 'Bad', bad: true, archived: false, color: null },
                createdAt: 1707825436000,
            });
        });

        it('should succesfuly fetch all flags filtering with associations (simulation pass)', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                filter: {
                    simulationPassIds: [1],
                    runNumbers: [106],
                    dplDetectorIds: [1],
                },
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            expect(flags[0].id).to.be.eql(5);
        });

        it('should succesfuly fetch all flags filtering with createdBy', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                filter: {
                    createdBy: ['Jan Jansen'],
                },
            });
            expect(count).to.be.equal(2);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(2);
            expect(flags.map(({ createdBy: { name } }) => name)).to.have.all.members(['Jan Jansen', 'Jan Jansen']);
        });

        it('should succesfuly fetch all flags filtering with ids', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                filter: {
                    ids: [1, 4],
                },
            });
            expect(count).to.be.equal(2);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(2);
            expect(flags.map(({ id }) => id)).to.have.all.members([1, 4]);
        });

        it('should succesfuly sort by id', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { id: 'ASC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedIds = flags.map(({ id }) => id);
            expect(fetchedIds).to.have.all.ordered.members([...fetchedIds].sort());
        });

        it('should succesfuly sort by `from` property', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { from: 'ASC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ from }) => from);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should succesfuly sort by `to` property', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { to: 'ASC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ to }) => to);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort());
        });

        it('should succesfuly sort by flag type name', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { flagTypeName: 'DESC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ flagType: { name } }) => name);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should succesfuly sort by createdBy name', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { createdBy: 'DESC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ createdBy: { name } }) => name);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should succesfuly sort by createdAt timestamp', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { createdBy: 'DESC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ createdAt }) => createdAt);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });

        it('should succesfuly sort by updatedAt timestamp', async () => {
            const { rows: flags, count } = await qcFlagService.getAll({
                sort: { updatedAt: 'DESC' },
            });
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            const fetchedSortedProperties = flags.map(({ updatedAt }) => updatedAt);
            expect(fetchedSortedProperties).to.have.all.ordered.members([...fetchedSortedProperties].sort().reverse());
        });
    });
};
