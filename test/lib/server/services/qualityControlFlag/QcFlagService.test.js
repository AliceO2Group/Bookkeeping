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
const { Op } = require('sequelize');
const { qcFlagAdapter } = require('../../../../../lib/database/adapters');

const qcFlagWithId1 = {
    id: 1,
    from: new Date('2019-08-08 22:43:20').getTime(),
    to: new Date('2019-08-09 04:16:40').getTime(),
    effectivePart: 1,
    comment: 'Some qc comment 1',

    // Associations
    createdById: 1,
    flagTypeId: 11, // LimitedAcceptance
    runNumber: 106,
    dplDetectorId: 1, // CPV
    createdAt: new Date('2024-02-13 11:57:16').getTime(),
    updatedAt: new Date('2024-02-13 11:57:16').getTime(),

    verifications: [],
    effectivePeriods: [],

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

        it('should fail to create quality control flag because qc flag `from` timestamp is smaller than run.startTime', async () => {
            const period = {
                from: new Date('2019-08-08 11:36:40').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
            };
            const runStart = new Date('2019-08-08 13:00:00').getTime();
            const runEnd = new Date('2019-08-09 14:00:00').getTime();

            const qcFlagCreationParameters = {
                ...period,
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
                new BadParameterError(`Given QC flag period (${period.from}, ${period.to}) is out of run (${runStart}, ${runEnd}) period`),
            );
        });

        it('should fail to create quality control flag because qc flag `from` timestamp is greater than `to` timestamp', async () => {
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
                new BadParameterError('There is not association between data pass with this id (9999),' +
                    ' run with this number (106) and detector with this name (CPV)'),
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

            const { id, from, to, effectivePart, comment, flagTypeId, runNumber, dplDetectorId,
                createdBy: { externalId: externalUserId }, effectivePeriods } =
                await qcFlagService.createForDataPass(qcFlagCreationParameters, relations);

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId, effectivePart, effectivePeriods }).to.be.eql({
                from: qcFlagCreationParameters.from,
                to: qcFlagCreationParameters.to,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: relations.flagTypeId,
                runNumber: relations.runNumber,
                dplDetectorId: relations.dplDetectorId,
                externalUserId: relations.user.externalUserId,
                effectivePart: 1,
                effectivePeriods: [
                    {
                        from: new Date('2019-08-09 01:29:50').getTime(),
                        to: new Date('2019-08-09 05:40:00').getTime(),
                    },
                ],
            });

            const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([relations.dataPassId]);

            // Check effective periods of older flags
            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        dplDetectorId,
                        id: { [Op.not]: id },
                    },
                    include: [
                        { association: 'effectivePeriods' },
                        {
                            association: 'dataPasses',
                            where: {
                                id: relations.dataPassId,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(qcFlagAdapter.toEntity);

                {
                    const [{ id, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 1,
                        effectivePart: 0.4995,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-08 22:43:20').getTime(),
                                to: new Date('2019-08-09 01:29:50').getTime(),
                            },
                        ],
                    });
                }
                {
                    const [, { id, from, to, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 2,
                        effectivePart: 1,
                        effectivePeriods: [
                            {
                                from,
                                to,
                            },
                        ],
                    });
                }

                {
                    const [, , { id, from, to, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 3,
                        effectivePart: 1,
                        effectivePeriods: [
                            {
                                from,
                                to,
                            },
                        ],
                    });
                }
            }

            // Create new one and Check effective periods of older flags
            {
                const qcFlagCreationParameters = {
                    from: new Date('2019-08-08 22:20:00').getTime(),
                    to: new Date('2019-08-09 04:00:00').getTime(),
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

                const { id, runNumber, dplDetectorId } =
                    await qcFlagService.createForDataPass(qcFlagCreationParameters, relations);

                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        dplDetectorId,
                        id: { [Op.not]: id },
                    },
                    include: [
                        { association: 'effectivePeriods' },
                        {
                            association: 'dataPasses',
                            where: {
                                id: relations.dataPassId,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(qcFlagAdapter.toEntity);

                {
                    const [{ id, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 1,
                        effectivePart: 0,
                        effectivePeriods: [],
                    });
                }
                {
                    const [, { id, from, to, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 2,
                        effectivePart: 1,
                        effectivePeriods: [
                            {
                                from,
                                to,
                            },
                        ],
                    });
                }

                {
                    const [, , { id, from, to, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 3,
                        effectivePart: 1,
                        effectivePeriods: [
                            {
                                from,
                                to,
                            },
                        ],
                    });
                }

                {
                    const [, , , { id, to, effectivePart, effectivePeriods }] = olderFlags;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({
                        id: 6,
                        effectivePart: 0.39973351099267157,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-09 04:00:00').getTime(),
                                to,
                            },
                        ],
                    });
                }
            }
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

            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        dplDetectorId,
                        id: { [Op.not]: id },
                    },
                    include: [
                        { association: 'effectivePeriods' },
                        {
                            association: 'dataPasses',
                            where: {
                                id: relations.dataPassId,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(qcFlagAdapter.toEntity);

                for (const olderFlag of olderFlags) {
                    const { id, effectivePart, effectivePeriods } = olderFlag;
                    expect({ id, effectivePart, effectivePeriods }).to.be.eql({ id, effectivePart: 0, effectivePeriods: [] });
                }
            }
        });
    });

    describe('Creating Quality Control Flag for simulation pass', () => {
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

        it('should fail to create quality control flag because qc flag `from` timestamp is smaller than run.startTime', async () => {
            const period = {
                from: new Date('2019-08-08 11:36:40').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
            };

            const runStart = new Date('2019-08-08 13:00:00').getTime();
            const runEnd = new Date('2019-08-09 14:00:00').getTime();

            const qcFlagCreationParameters = {
                ...period,
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
                new BadParameterError(`Given QC flag period (${period.from}, ${period.to}) is out of run (${runStart}, ${runEnd}) period`),
            );
        });

        it('should fail to create quality control flag because qc flag `from` timestamp is greater than `to` timestamp', async () => {
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
                new BadParameterError('There is not association between simulation pass with this id (9999),' +
                    ' run with this number (106) and detector with this name (CPV)'),
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
        it('should fail to delete QC flag which is verified', async () => {
            const id = 4;
            const relations = {
                userWithRoles: { externalUserId: 456 },
            };
            await assert.rejects(
                () => qcFlagService.delete(id, relations),
                new ConflictError('Cannot delete QC flag which is verified'),
            );
        });

        it('should succesfuly delete QC flag of dataPass', async () => {
            const id = 1;

            await qcFlagService.delete(id);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);
        });

        it('should succesfuly delete QC flag of simulationPass ', async () => {
            const creationRelations = {
                user: {
                    externalUserId: 1,
                },
                flagTypeId: 2,
                runNumber: 106,
                simulationPassId: 1,
                dplDetectorId: 1,
            };

            const { id } = await qcFlagService.createForSimulationPass({}, creationRelations);

            await qcFlagService.delete(id);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);
        });
    });

    describe('Verifying Quality Control Flag', () => {
        it('should fail to verify QC flag when being owner', async () => {
            const parameters = {
                flagId: 3,
            };
            const relations = {
                user: { externalUserId: 1 },
            };
            await assert.rejects(
                () => qcFlagService.verifyFlag(parameters, relations),
                new AccessDeniedError('You cannot verify QC flag created by you'),
            );
        });
        it('should succesfuly verify QC flag when not being owner', async () => {
            const parameters = {
                flagId: 3,
                comment: 'Some Comment',
            };

            const relations = {
                user: { externalUserId: 456 },
            };

            {
                const verifiedFlag = await qcFlagService.verifyFlag(parameters, relations);
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
                const fetchedQcFlag = await qcFlagService.getById(parameters.flagId);
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
