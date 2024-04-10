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
const { repositories: { QcFlagRepository, RunRepository } } = require('../../../../../lib/database');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { expect } = require('chai');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');

const qcFlagWithId1 = {
    id: 1,
    from: new Date('2019-08-08 22:43:20').getTime(),
    to: new Date('2019-08-09 04:16:40').getTime(),
    comment: 'Some qc comment 1',

    // Associations
    createdById: 1,
    flagTypeId: 11, // LimitedAcceptance
    runNumber: 106,
    dplDetectorId: 1, // CPV
    createdAt: new Date('2024-02-13 11:57:16').getTime(),
    updatedAt: new Date('2024-02-13 11:57:16').getTime(),

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
                createdAt: 1707825439000,
                updatedAt: 1707825439000,
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
                sort: { flagType: 'DESC' },
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
                sort: { createdAt: 'DESC' },
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

    describe('Creating Quality Control Flag for data pass', () => {
        /** Flags for runNumber: 106, LHC22b_apass1, CPV */
        // Run trg time middle point: 1565314200, radius: 45000 seconds
        it('should fail to create quality control flag due to incorrect external user id', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 9999999, // Failing property
                },
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForDataPass(qcFlagCreationParameters, relations),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag due to qc flag time period out of range of run\'s period', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-08 11:36:40').getTime(), // Failing property
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForDataPass(qcFlagCreationParameters, relations),
                // eslint-disable-next-line max-len
                new BadParameterError(`Given QC flag period (${new Date('2019-08-08 11:36:40').getTime()}, ${new Date('2019-08-09 05:40:00').getTime()}) is out of run (${new Date('2019-08-08 13:00:00').getTime()}, ${new Date('2019-08-09 14:00:00').getTime()}) period`),
            );
        });

        it('should fail to create quality control flag due to qc flag time period out of range of run\'s period', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 04:16:40').getTime(), // Failing property
                to: new Date('2019-08-08 21:20:00').getTime(), // Failing property
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForDataPass(qcFlagCreationParameters, relations),
                new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp'),
            );
        });

        it('should fail to create QC flag because there is no association between data pass, run and dpl detector', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 9999, // Failing property
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForDataPass(qcFlagCreationParameters, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('There is not association between data pass with this id (9999), run with this number (106) and detector with this name (CPV)'),
            );
        });

        it('should succesfuly create quality control flag with externalUserId', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.createForDataPass(qcFlagCreationParameters, relations);

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: qcFlagCreationParameters.from,
                to: qcFlagCreationParameters.to,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: relations.flagTypeId,
                runNumber: relations.runNumber,
                dplDetectorId: relations.dplDetectorId,
                externalUserId: relations.user.externalUserId,
            });

            const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([relations.dataPassId]);
        });

        it('should succesfuly create quality control flag without timstamps', async () => {
            const qcFlagCreationParameters = {
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.createForDataPass(qcFlagCreationParameters, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: relations.flagTypeId,
                runNumber: relations.runNumber,
                dplDetectorId: relations.dplDetectorId,
                externalUserId: relations.user.externalUserId,
            });

            const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([relations.dataPassId]);
        });
    });

    describe('Creating Quality Control Flag for simulation pass', () => {
        /** Flags for runNumber: 106, LHC22b_apass1, CPV */
        // Run trg time middle point: 1565314200, radius: 45000 seconds
        it('should fail to create quality control flag due to incorrect external user id', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 9999999,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForSimulationPass(qcFlagCreationParameters, relations),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag due to incorrect qc flag time period', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-08 11:36:40').getTime(), // Failing property
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForSimulationPass(qcFlagCreationParameters, relations),
                // eslint-disable-next-line max-len
                new BadParameterError(`Given QC flag period (${new Date('2019-08-08 11:36:40').getTime()}, ${new Date('2019-08-09 05:40:00').getTime()}) is out of run (${(1565314200 - 45000) * 1000}, ${(1565314200 + 45000) * 1000}) period`),
            );
        });

        it('should fail to create quality control flag due to incorrect qc flag time period', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 04:16:40').getTime(), // Failing property
                to: new Date('2019-08-08 21:20:00').getTime(), // Failing property
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForSimulationPass(qcFlagCreationParameters, relations),
                new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp'),
            );
        });

        it('should fail to create QC flag because there is no association between simulation pass, run and dpl detector', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 9999, // Failing property
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qcFlagService.createForSimulationPass(qcFlagCreationParameters, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('There is not association between simulation pass with this id (9999), run with this number (106) and detector with this name (CPV)'),
            );
        });

        it('should succesfuly create quality control flag with externalUserId', async () => {
            const qcFlagCreationParameters = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.createForSimulationPass(qcFlagCreationParameters, relations);

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: qcFlagCreationParameters.from,
                to: qcFlagCreationParameters.to,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: relations.flagTypeId,
                runNumber: relations.runNumber,
                dplDetectorId: relations.dplDetectorId,
                externalUserId: relations.user.externalUserId,
            });

            const fetchedFlagWithSimulationPass = await QcFlagRepository.findOne({
                include: [{ association: 'simulationPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithSimulationPass.simulationPasses.map(({ id }) => id)).to.have.all.members([relations.simulationPassId]);
        });

        it('should succesfuly create quality control flag without timstamps', async () => {
            const qcFlagCreationParameters = {
                comment: 'VERY INTERESTING REMARK',
            };

            const relations = {
                user: {
                    externalUserId: 456,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.createForSimulationPass(qcFlagCreationParameters, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: relations.flagTypeId,
                runNumber: relations.runNumber,
                dplDetectorId: relations.dplDetectorId,
                externalUserId: relations.user.externalUserId,
            });

            const fetchedFlagWithSimulationPass = await QcFlagRepository.findOne({
                include: [{ association: 'simulationPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithSimulationPass.simulationPasses.map(({ id }) => id)).to.have.all.members([relations.simulationPassId]);
        });
    });

    describe('Delating Quality Control Flag', () => {
        it('should fail to delete QC flag when being neither owner nor admin', async () => {
            const id = 1;
            const relations = {
                user: { externalUserId: 456 },
            };
            await assert.rejects(
                () => qcFlagService.delete(id, relations),
                new Error('You are not allowed to remove this QC flag'),
            );
        });
        it('should succesfuly delete QC flag as admin', async () => {
            const id = 2;
            const relations = {
                user: { externalUserId: 456, isAdmin: true },
            };

            await qcFlagService.delete(id, relations);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);
        });
        it('should succesfuly delete QC flag as owner', async () => {
            const id = 1;
            const relations = {
                user: { externalUserId: 1 },
            };

            await qcFlagService.delete(id, relations);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);
        });
    });
};
