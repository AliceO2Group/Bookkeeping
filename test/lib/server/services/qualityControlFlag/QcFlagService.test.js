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
const { repositories: { QcFlagRepository, RunRepository, QcFlagEffectivePeriodRepository } } = require('../../../../../lib/database');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { expect } = require('chai');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError');
const { Op } = require('sequelize');
const { qcFlagAdapter } = require('../../../../../lib/database/adapters');

/**
 * Get effective part and periods of Qc flag
 * @param {number} flagId QC flag id
 * @return {Promise<{ from: number, to: number }[]>} effective periods
 */
const getEffectivePeriodsOfQcFlag = async (flagId) => (await QcFlagEffectivePeriodRepository.findAll({ where: { flagId } }))
    .map(({ from, to }) => ({ from: from.getTime(), to: to.getTime() }));

const qcFlagWithId1 = {
    id: 1,
    from: new Date('2019-08-08 22:43:20').getTime(),
    to: new Date('2019-08-09 04:16:40').getTime(),
    comment: 'Some qc comment 1',
    origin: null,

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
        method: 'LimitedAcceptance',
        name: 'Limited acceptance',
        bad: true,
        color: '#FFFF00',
        archived: false,
    },

    verifications: [],
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
            expect(count).to.be.equal(2);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(2);
            expect(flags[0].qcFlagId).to.equal(6);
        });
    });

    describe('Get QC flags summary', () => {
        it('should succsessfully get non-empty QC flag summary for data pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId: 1 })).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 3,
                        badEffectiveRunCoverage: 0.8376,
                    },
                },
            });
        });

        it('should succsessfully get non-empty QC flag summary for data pass when all flags are verified', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId: 2 })).to.be.eql({
                1: {
                    1: {
                        missingVerificationsCount: 0,
                        badEffectiveRunCoverage: 0.0196,
                    },
                },
            });
        });

        it('should succsessfully get empty QC flag summary for data pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId: 3 })).to.be.eql({});
        });

        it('should succsessfully get non-empty QC flag summary for simulation pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ simulationPassId: 1 })).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 1,
                        badEffectiveRunCoverage: 0.9310,
                    },
                },
            });
        });

        it('should succsessfully get empty QC flag summary for simulation pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ simulationPassId: 2 })).to.be.eql({});
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
                dataPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            // Failing property
            const relations = { user: { roles: ['admin'], externalUserId: 9999999 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag due to insufficient permission', async () => {
            const qcFlag = {
                from: null,
                to: null,
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 }, // CPV
            };

            // Failing property
            const relations = { user: { roles: ['det-glo'], externalUserId: 1 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                new BadParameterError('You have no permission to manage flags for CPV detector'),
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
                dataPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
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
                dataPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
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
                dataPassIdentifier: { id: 9999 }, // Failing property
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('Data pass with this id (9999) could not be found'),
            );
        });

        it('should successfully create quality control flag with externalUserId', async () => {
            const qcFlags = [
                {
                    from: new Date('2019-08-09 01:29:50').getTime(),
                    to: new Date('2019-08-09 03:20:00').getTime(),
                    comment: 'Very interesting remark',
                    flagTypeId: 3,
                },
                {
                    from: new Date('2019-08-09 03:20:00').getTime(),
                    to: new Date('2019-08-09 05:40:00').getTime(),
                    comment: 'Another interesting remark',
                    flagTypeId: 2,
                },
            ];

            const scope = {
                runNumber: 106,
                dataPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            const createdQcFlags = await qcFlagService.create(qcFlags, scope, relations);

            for (const qcFlagIndex in qcFlags) {
                const {
                    id,
                    from,
                    to,
                    comment,
                    flagTypeId,
                    runNumber,
                    dplDetectorId,
                    createdBy: { externalId: externalUserId },
                } = createdQcFlags[qcFlagIndex];
                const qcFlag = qcFlags[qcFlagIndex];

                expect({
                    from,
                    to,
                    comment,
                    flagTypeId,
                    runNumber,
                    dplDetectorId,
                    externalUserId,
                    effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
                }).to.be.eql({
                    from: qcFlag.from,
                    to: qcFlag.to,
                    comment: qcFlag.comment,
                    flagTypeId: qcFlag.flagTypeId,
                    runNumber: scope.runNumber,
                    dplDetectorId: scope.dplDetectorIdentifier.dplDetectorId,
                    externalUserId: relations.user.externalUserId,
                    effectivePeriods: [
                        {
                            from: qcFlag.from,
                            to: qcFlag.to,
                        },
                    ],
                });

                const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                    include: [{ association: 'dataPasses' }],
                    where: { id },
                });
                expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([scope.dataPassIdentifier.id]);
            }

            // Check effective periods of older flags
            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber: scope.runNumber,
                        dplDetectorId: scope.dplDetectorIdentifier.dplDetectorId,
                        id: { [Op.notIn]: createdQcFlags.map(({ id }) => id) },
                    },
                    include: [
                        {
                            association: 'dataPasses',
                            where: {
                                id: scope.dataPassIdentifier.id,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(({ id }) => id);

                const effectivePeriods = await Promise.all(olderFlags.map(async (id) => ({
                    id,
                    effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
                })));
                expect(effectivePeriods).to.eql([
                    {
                        id: 1,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-08 22:43:20').getTime(),
                                to: new Date('2019-08-09 01:29:50').getTime(),
                            },
                        ],
                    },
                    {
                        id: 2,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-09 05:40:00').getTime(),
                                to: new Date('2019-08-09 07:03:20').getTime(),
                            },
                        ],
                    },
                    {
                        id: 3,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-09 08:26:40').getTime(),
                                to: new Date('2019-08-09 09:50:00').getTime(),
                            },
                        ],
                    },
                ]);
            }

            // Create new one and Check effective periods of older flags
            {
                const qcFlag = {
                    from: new Date('2019-08-08 22:20:00').getTime(),
                    to: new Date('2019-08-09 04:00:00').getTime(),
                    comment: 'VERY INTERESTING REMARK',
                    flagTypeId: 2,
                };

                const scope = {
                    runNumber: 106,
                    dataPassIdentifier: { id: 1 },
                    dplDetectorIdentifier: { dplDetectorId: 1 },
                };

                const relations = { user: { roles: ['admin'], externalUserId: 456 } };

                const [{ id, runNumber, dplDetectorId }] = await qcFlagService.create([qcFlag], scope, relations);

                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        dplDetectorId,
                        id: { [Op.not]: id },
                    },
                    include: [
                        {
                            association: 'dataPasses',
                            where: { id: scope.dataPassIdentifier.id },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(({ id }) => id);

                const effectivePeriods = await Promise.all(olderFlags.map(async (id) => ({
                    id,
                    effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
                })));

                expect(effectivePeriods).to.eql([
                    {
                        id: 1,
                        effectivePeriods: [],
                    },
                    {
                        id: 2,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-09 05:40:00').getTime(),
                                to: new Date('2019-08-09 07:03:20').getTime(),
                            },
                        ],
                    },
                    {
                        id: 3,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-09 08:26:40').getTime(),
                                to: new Date('2019-08-09 09:50:00').getTime(),
                            },
                        ],
                    },
                    {
                        id: 7,
                        effectivePeriods: [],
                    },
                    {
                        id: 8,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-09 04:00:00').getTime(),
                                to: new Date('2019-08-09 05:40:00').getTime(),
                            },
                        ],
                    },
                ]);
            }
        });

        it('should succesfuly create quality control flag without timestamps', async () => {
            const qcFlag = {
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };
            const relations = { user: { roles: ['det-cpv'], externalUserId: 456 } };

            const [{ id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId }, createdAt }] =
                await qcFlagService.create([qcFlag], scope, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorIdentifier.dplDetectorId,
                externalUserId: relations.user.externalUserId,
            });

            const fetchedFlagWithDataPass = await QcFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: { id },
            });
            expect(fetchedFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([scope.dataPassIdentifier.id]);

            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        dplDetectorId,
                        createdAt: { [Op.lt]: createdAt },
                    },
                    include: [
                        {
                            association: 'dataPasses',
                            where: {
                                id: scope.dataPassIdentifier.id,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(qcFlagAdapter.toEntity);

                for (const olderFlag of olderFlags) {
                    const { id } = olderFlag;
                    expect({ id, effectivePeriods: await getEffectivePeriodsOfQcFlag(id) }).to.be.eql({ id, effectivePeriods: [] });
                }
            }
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
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 9999999 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag due to insufficient permission', async () => {
            const qcFlag = {
                from: null,
                to: null,
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 }, // CPV
            };

            const relations = { user: { roles: ['det-its'], externalUserId: 1 } };
            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                new BadParameterError('You have no permission to manage flags for CPV detector'),
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
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
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
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
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
                simulationPassIdentifier: { id: 9999 }, // Failing property
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('Simulation pass with this id (9999) could not be found'),
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
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };
            const relations = { user: { roles: ['det-cpv'], externalUserId: 456 } };

            const [{ id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } }] =
                await qcFlagService.create([qcFlag], scope, relations);

            expect({
                from,
                to,
                comment,
                flagTypeId,
                runNumber,
                dplDetectorId,
                externalUserId,
                effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
            }).to.be.eql({
                from: qcFlag.from,
                to: qcFlag.to,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorIdentifier.dplDetectorId,
                externalUserId: relations.user.externalUserId,
                effectivePeriods: [{ from, to }],
            });

            const fetchedFlagWithSimulationPass = await QcFlagRepository.findOne({
                include: [{ association: 'simulationPasses' }],
                where: {
                    id,
                },
            });

            expect(fetchedFlagWithSimulationPass.simulationPasses.map(({ id }) => id)).to.have.all.members([scope.simulationPassIdentifier.id]);

            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        dplDetectorId,
                        id: { [Op.not]: id },
                    },
                    include: [
                        {
                            association: 'simulationPasses',
                            where: {
                                id: scope.simulationPassIdentifier.id,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(qcFlagAdapter.toEntity);

                {
                    const [{ id }] = olderFlags;
                    expect({ id, effectivePeriods: await getEffectivePeriodsOfQcFlag(id) }).to.be.eql({
                        id: 5,
                        effectivePeriods: [
                            {
                                from: new Date('2019-08-08 13:46:40').getTime(),
                                to: new Date('2019-08-09 01:29:50').getTime(),
                            },
                            {
                                from: new Date('2019-08-09 05:40:00').getTime(),
                                to: new Date('2019-08-09 07:50:00').getTime(),
                            },
                        ],
                    });
                }
            }
        });

        it('should succesfuly create quality control flag without timstamps', async () => {
            const qcFlagCreationParameters = {
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            const [{ id, from, to, comment, flagTypeId, runNumber, dplDetectorId, createdBy: { externalId: externalUserId } }] =
                await qcFlagService.create([qcFlagCreationParameters], scope, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, dplDetectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: qcFlagCreationParameters.flagTypeId,
                runNumber: scope.runNumber,
                dplDetectorId: scope.dplDetectorIdentifier.dplDetectorId,
                externalUserId: relations.user.externalUserId,
            });

            const fetchedFlagWithSimulationPass = await QcFlagRepository.findOne({
                include: [{ association: 'simulationPasses' }],
                where: {
                    id,
                },
            });
            expect(fetchedFlagWithSimulationPass.simulationPasses.map(({ id }) => id)).to.have.all.members([scope.simulationPassIdentifier.id]);
        });

        it('should throw when trying to create a flag with data pass and simulation pass at the same time', async () => {
            const scope = {
                runNumber: 106,
                dataPassIdentifier: { id: 1 },
                simulationPassIdentifier: { id: 1 },
                dplDetectorId: 1,
            };

            const relations = { user: { roles: ['admin'], externalUserId: 1 } };

            await assert.rejects(
                () => qcFlagService.create({}, scope, relations),
                new BadParameterError('Cannot create QC flag for data pass and simulation pass simultaneously'),
            );
        });
    });

    describe('Deleting Quality Control Flag', () => {
        it('should fail to delete QC flag which is verified', async () => {
            const id = 4;
            await assert.rejects(
                () => qcFlagService.delete(id),
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
                simulationPassIdentifier: { id: 1 },
                dplDetectorIdentifier: { dplDetectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 1 } };

            const [{ id, createdAt }] = await qcFlagService.create([{ flagTypeId: 2 }], scope, relations);

            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber: 106,
                        dplDetectorId: 1,
                        createdAt: { [Op.lt]: createdAt },
                    },
                    include: [
                        {
                            association: 'simulationPasses',
                            where: {
                                id: 1,
                            },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                })).map(qcFlagAdapter.toEntity);
                {
                    const { id } = olderFlags[olderFlags.length - 1];
                    expect({ effectivePeriods: await getEffectivePeriodsOfQcFlag(id) }).to.be.eql({
                        effectivePeriods: [],
                    });
                }
            }

            await qcFlagService.delete(id);
            const fetchedQcFlag = await qcFlagService.getById(id);
            expect(fetchedQcFlag).to.be.equal(null);

            {
                const olderFlags = await QcFlagRepository.findAll({
                    where: {
                        runNumber: 106,
                        dplDetectorId: 1,
                    },
                    include: [
                        { association: 'effectivePeriods' },
                        {
                            association: 'simulationPasses',
                            where: { id: 1 },
                        },
                    ],
                    order: [['createdAt', 'ASC']],
                });

                {
                    expect(olderFlags.some(({ from, to, effectivePeriods }) => {
                        const [{ from: fetchedFrom, to: fetchedTo } = {}] = effectivePeriods;
                        return fetchedFrom === from && fetchedTo === to;
                    }));
                }
            }
        });
    });

    describe('Verifying Quality Control Flag', () => {
        it('should succesfuly verify QC flag when not being owner', async () => {
            const qcFlag = {
                flagId: 3,
                comment: 'Some Comment',
            };

            const relations = {
                user: { roles: ['det-cpv'], externalUserId: 456 },
            };

            {
                const verifiedFlag = await qcFlagService.verifyFlag(qcFlag, relations);
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
