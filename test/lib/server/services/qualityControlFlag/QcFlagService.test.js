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
const { AccessDeniedError } = require('../../../../../lib/server/errors/AccessDeniedError.js');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError');

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

    verifications: [],

    createdBy: {
        id: 1,
        name: 'John Doe',
        externalId: 1,
    },
    flagType: {
        id: 11,
        method: 'LimitedAcceptance',
        name: 'Limited acceptance',
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

        it('should successfully fetch all flags for a given data pass', async () => {
            {
                const { rows: flags, count } = await qcFlagService.getAllPerDataPassAndRunAndDetector({
                    dataPassId: 1,
                    runNumber: 106,
                    dplDetectorId: 1,
                });
                expect(count).to.be.equal(3);
                expect(flags).to.be.an('array');
                expect(flags).to.be.lengthOf(3);
                expect(flags.map(({ qcFlagId }) => qcFlagId)).to.have.all.members([1, 2, 3]);
            }

            {
                const { rows: flags, count } = await qcFlagService.getAllPerDataPassAndRunAndDetector({
                    dataPassId: [2],
                    runNumber: [1],
                    dplDetectorId: [1],
                });
                expect(count).to.be.equal(1);
                expect(flags).to.be.an('array');
                expect(flags).to.be.lengthOf(1);
                const [fetchedFlag] = flags;
                expect(fetchedFlag.qcFlagId).to.equal(4);
            }
        });

        it('should successfully fetch all flags for a given simulation pass', async () => {
            const { rows: flags, count } = await qcFlagService.getAllPerSimulationPassAndRunAndDetector({
                simulationPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            expect(flags[0].qcFlagId).to.equal(5);
        });
    });

    describe('Creating Quality Control Flag for data pass', () => {
        it('should fail to create quality control flag due to incorrect external user id', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            // Failing property
            const relations = { userIdentifier: { externalUserId: 9999999 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag because qc flag `from` timestamp is smaller than run.startTime', async () => {
            const period = {
                from: new Date('2019-08-08 11:36:40').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
            };
            const runStart = new Date('2019-08-08 13:00:00').getTime();
            const runEnd = new Date('2019-08-09 14:00:00').getTime();

            const qcFlag = {
                ...period,
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError(`Given QC flag period (${period.from}, ${period.to}) is out of run (${runStart}, ${runEnd}) period`),
            );
        });

        it('should fail to create quality control flag because qc flag `from` timestamp is greater than `to` timestamp', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 04:16:40').getTime(), // Failing property
                to: new Date('2019-08-08 21:20:00').getTime(), // Failing property
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp'),
            );
        });

        it('should fail to create QC flag because there is no association between data pass, run and dpl detector', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassId: 9999, // Failing property
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('There is not association between run with this number (106), detector with this name (CPV), data pass' +
                    ' with this id (9999)'),
            );
        });

        it('should succesfuly create quality control flag with externalUserId', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.create(qcFlag, scope, relations);

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: qcFlag.from,
                to: qcFlag.to,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorId,
                externalUserId: relations.userIdentifier.externalUserId,
            });

            const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([scope.dataPassId]);
        });

        it('should succesfuly create quality control flag without timstamps', async () => {
            const qcFlag = {
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.create(qcFlag, scope, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorId,
                externalUserId: relations.userIdentifier.externalUserId,
            });

            const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([scope.dataPassId]);
        });
    });

    describe('Creating Quality Control Flag for simulation pass', () => {
        it('should fail to create quality control flag due to incorrect external user id', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 9999999 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag because qc flag `from` timestamp is smaller than run.startTime', async () => {
            const period = {
                from: new Date('2019-08-08 11:36:40').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
            };

            const runStart = new Date('2019-08-08 13:00:00').getTime();
            const runEnd = new Date('2019-08-09 14:00:00').getTime();

            const qcFlag = {
                ...period,
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError(`Given QC flag period (${period.from}, ${period.to}) is out of run (${runStart}, ${runEnd}) period`),
            );
        });

        it('should fail to create quality control flag because qc flag `from` timestamp is greater than `to` timestamp', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 04:16:40').getTime(), // Failing property
                to: new Date('2019-08-08 21:20:00').getTime(), // Failing property
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp'),
            );
        });

        it('should fail to create QC flag because there is no association between simulation pass, run and dpl detector', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassId: 9999, // Failing property
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create(qcFlag, scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('There is not association between run with this number (106), detector with this name (CPV),' +
                    ' simulation pass with this id (9999)'),
            );
        });

        it('should succesfuly create quality control flag with externalUserId', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.create(qcFlag, scope, relations);

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: qcFlag.from,
                to: qcFlag.to,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorId,
                externalUserId: relations.userIdentifier.externalUserId,
            });

            const fetchedFlagWithSimulationPass = await QcFlagRepository.findOne({
                include: [{ association: 'simulationPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithSimulationPass.simulationPasses.map(({ id }) => id)).to.have.all.members([scope.simulationPassId]);
        });

        it('should succesfuly create quality control flag without timstamps', async () => {
            const qcFlagCreationParameters = {
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 456 } };

            const { id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } } =
                await qcFlagService.create(qcFlagCreationParameters, scope, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: qcFlagCreationParameters.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorId,
                externalUserId: relations.userIdentifier.externalUserId,
            });

            const fetchedFlagWithSimulationPass = await QcFlagRepository.findOne({
                include: [{ association: 'simulationPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithSimulationPass.simulationPasses.map(({ id }) => id)).to.have.all.members([scope.simulationPassId]);
        });

        it('should throw when trying to create a flag with data pass and simulation pass at the same time', async () => {
            const scope = {
                runNumber: 106,
                dataPassId: 1,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 1 } };

            await assert.rejects(
                () => qcFlagService.create({}, scope, relations),
                new BadParameterError('Cannot create QC flag for data pass and simulation pass simultaneously'),
            );
        });
    });

    describe('Deleting Quality Control Flag', () => {
        it('should fail to delete QC flag which is verified', async () => {
            const id = 4;
            const relations = {
                userIdentifierWithRoles: { externalUserId: 456 },
            };
            await assert.rejects(
                () => qcFlagService.delete(id, relations),
                new ConflictError('Cannot delete QC flag which is verified'),
            );
        });

        it('should successfully delete QC flag of dataPass', async () => {
            const id = 1;

            await qcFlagService.delete(id);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);
        });

        it('should successfully delete QC flag of simulationPass ', async () => {
            const scope = {
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const relations = { userIdentifier: { externalUserId: 1 } };

            const { id } = await qcFlagService.create({ flagTypeId: 2 }, scope, relations);

            await qcFlagService.delete(id);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);
        });
    });

    describe('Verifying Quality Control Flag', () => {
        it('should fail to verify QC flag when being owner', async () => {
            const qcFlag = {
                flagId: 3,
            };
            const scope = {
                user: { externalUserId: 1 },
            };
            await assert.rejects(
                () => qcFlagService.verifyFlag(qcFlag, scope),
                new AccessDeniedError('You cannot verify QC flag created by you'),
            );
        });
        it('should succesfuly verify QC flag when not being owner', async () => {
            const qcFlag = {
                flagId: 3,
                comment: 'Some Comment',
            };

            const scope = {
                user: { externalUserId: 456 },
            };

            {
                const verifiedFlag = await qcFlagService.verifyFlag(qcFlag, scope);
                const { id, verifications } = verifiedFlag;
                expect(verifications).to.be.an('array');
                expect(verifications).to.be.lengthOf(1);
                const [{ createdBy, createdById, comment, flagId }] = verifications;
                expect({ id, createdBy, createdById, comment, flagId }).to.be.eql({
                    id: 3,
                    flagId: 3,
                    createdById: 2,
                    createdBy: { id: 2, externalId: 456, name: 'Jan Jansen' },
                    comment,
                });
            }
            {
                const fetchedQcFlag = await qcFlagService.getById(qcFlag.flagId);
                const { verifications } = fetchedQcFlag;
                const [{ createdBy, createdById, comment, flagId }] = verifications;
                expect({ createdBy, createdById, comment, flagId }).to.be.eql({
                    flagId: 3,
                    createdById: 2,
                    createdBy: { id: 2, externalId: 456, name: 'Jan Jansen' },
                    comment,
                });
            }
        });
    });
};
