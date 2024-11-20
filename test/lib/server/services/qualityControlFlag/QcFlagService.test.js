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
const { runService } = require('../../../../../lib/server/services/run/RunService');
const { gaqDetectorService } = require('../../../../../lib/server/services/gaq/GaqDetectorsService');

/**
 * Get effective part and periods of Qc flag
 * @param {number} flagId QC flag id
 * @return {Promise<{ from: number, to: number }[]>} effective periods
 */
const getEffectivePeriodsOfQcFlag = async (flagId) => (await QcFlagEffectivePeriodRepository.findAll({ where: { flagId } }))
    .map(({ from, to }) => ({ from: from?.getTime() ?? null, to: to?.getTime() ?? null }));

const qcFlagWithId1 = {
    id: 1,
    from: new Date('2019-08-08 22:43:20').getTime(),
    to: new Date('2019-08-09 04:16:40').getTime(),
    comment: 'Some qc comment 1',
    origin: null,

    // Associations
    createdById: 1,
    flagTypeId: 5, // LimitedAcceptance MC Reproducible
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
        id: 5,
        name: 'Limited Acceptance MC Reproducible',
        method: 'LimitedAcceptanceMCReproducible',
        bad: true,
        color: '#FFFF00',
        archived: false,
        mcReproducible: true,
    },

    verifications: [],
    effectivePeriods: [],
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
                    detectorId: 1,
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
                    detectorId: [1],
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
                detectorId: 1,
            });
            expect(count).to.be.equal(2);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(2);
            expect(flags[0].qcFlagId).to.equal(6);
        });

        it('should successfully fetch all synchronous flags for run and detector', async () => {
            const runNumber = 56;
            const detectorId = 7;
            {
                const { rows: flags, count } = await qcFlagService.getAllSynchronousPerRunAndDetector({ runNumber, detectorId });
                expect(count).to.be.equal(2);
                expect(flags.map(({ id }) => id)).to.have.all.ordered.members([101, 100]);
            }
            {
                const { rows: flags, count } = await qcFlagService.getAllSynchronousPerRunAndDetector(
                    { runNumber, detectorId },
                    { limit: 1, offset: 1 },
                );
                expect(count).to.be.equal(2);
                expect(flags).to.be.lengthOf(1);
                const [flag] = flags;
                expect(flag.id).to.be.equal(100);

                expect(flag.verifications[0].comment).to.be.equal('good');
            }
        });
    });

    describe('Get QC flags summary', () => {
        it('should successfully get non-empty QC flag summary for data pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId: 1 })).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 3,
                        mcReproducible: true,
                        badEffectiveRunCoverage: 0.3333,
                        explicitlyNotBadEffectiveRunCoverage: 0,
                        qualityNotDefinedEffectiveRunCoverage: 0.6667000000000001,
                    },
                    16: {
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        mcReproducible: false,
                        missingVerificationsCount: 1,
                        qualityNotDefinedEffectiveRunCoverage: 0,
                    },
                },
            });
        });

        it('should successfully get non-empty QC flag summary with MC.Reproducible interpreted as not-bad for data pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId: 1 }, { mcReproducibleAsNotBad: true })).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 3,
                        mcReproducible: true,
                        badEffectiveRunCoverage: 0.1111,
                        explicitlyNotBadEffectiveRunCoverage: 0.2222,
                        qualityNotDefinedEffectiveRunCoverage: 0.6667,
                    },
                    16: {
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        mcReproducible: false,
                        missingVerificationsCount: 1,
                        qualityNotDefinedEffectiveRunCoverage: 0,
                    },
                },
            });
        });

        it('should successfully get non-empty QC flag summary for data pass when all flags are verified', async () => {
            const dataPassId = 2;
            const run = await RunRepository.findOne({ where: { runNumber: 1 } });
            const { timeTrgStart, timeO2Start, timeTrgEnd, timeO2End } = run;
            const runDuration = (timeTrgEnd ?? timeO2End) - (timeTrgStart ?? timeO2Start);

            const effectivePeriods = await QcFlagEffectivePeriodRepository.findAll({
                include: [
                    {
                        association: 'flag',
                        where: { runNumber: run.runNumber },
                        include: [
                            { association: 'dataPasses', where: { id: dataPassId } },
                            { association: 'flagType', where: { bad: true } },
                        ],
                    },
                ],
            });
            const badCoverage = effectivePeriods
                .filter(({ flag: { flagType: { bad } } }) => bad)
                .reduce((coverage, { from, to }) => coverage + (to - from), 0);

            const goodCoverage = effectivePeriods
                .filter(({ flag: { flagType: { bad } } }) => !bad)
                .reduce((coverage, { from, to }) => coverage + (to - from), 0);

            expect(await qcFlagService.getQcFlagsSummary({ dataPassId })).to.be.eql({
                1: {
                    1: {
                        missingVerificationsCount: 0,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0.0769,
                        explicitlyNotBadEffectiveRunCoverage: 0,
                        qualityNotDefinedEffectiveRunCoverage: 0.9231,
                    },
                },
            });

            expect(goodCoverage / runDuration).to.be.equal(0);
            expect((badCoverage / runDuration).toFixed(4)).to.be.equal('0.0769');

            // Verify flag and fetch summary one more time
            const relations = { user: { roles: ['admin'], externalUserId: 456 } };
            await qcFlagService.verifyFlag({ flagId: 4 }, relations);
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId })).to.be.eql({
                1: {
                    1: {
                        missingVerificationsCount: 0,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0.0769,
                        explicitlyNotBadEffectiveRunCoverage: 0,
                        qualityNotDefinedEffectiveRunCoverage: 0.9231,
                    },
                },
            });
        });

        it('should successfully get empty QC flag summary for data pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ dataPassId: 3 })).to.be.eql({
                56: {
                    4: {
                        badEffectiveRunCoverage: 0.5,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        mcReproducible: false,
                        missingVerificationsCount: 2,
                        qualityNotDefinedEffectiveRunCoverage: -0.5,
                    },
                    7: {
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        mcReproducible: false,
                        missingVerificationsCount: 1,
                        qualityNotDefinedEffectiveRunCoverage: 0,
                    },
                },
            });
        });

        it('should successfully get non-empty QC flag summary for simulation pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ simulationPassId: 1 })).to.be.eql({
                106: {
                    1: {
                        missingVerificationsCount: 1,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0.7222,
                        explicitlyNotBadEffectiveRunCoverage: 0,
                        qualityNotDefinedEffectiveRunCoverage: 0.27780000000000005,
                    },
                },
            });
        });

        it('should successfully get empty QC flag summary for simulation pass', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ simulationPassId: 2 })).to.be.eql({});
        });

        it('should successfully get QC summary of synchronous QC flags for one LHC Period', async () => {
            expect(await qcFlagService.getQcFlagsSummary({ lhcPeriodId: 1 })).to.be.eql({
                56: {
                    // FT0
                    7: {
                        missingVerificationsCount: 1,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0.1667,
                        explicitlyNotBadEffectiveRunCoverage: 0.8333,
                        qualityNotDefinedEffectiveRunCoverage: 0,
                    },

                    // ITS
                    4: {
                        missingVerificationsCount: 1,
                        mcReproducible: false,
                        badEffectiveRunCoverage: 0,
                        explicitlyNotBadEffectiveRunCoverage: 1,
                        qualityNotDefinedEffectiveRunCoverage: 0,
                    },
                },
            });
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 }, // CPV
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 },
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
                    dplDetectorId: detectorId,
                    createdBy: { externalId: externalUserId },
                } = createdQcFlags[qcFlagIndex];
                const qcFlag = qcFlags[qcFlagIndex];

                expect({
                    from,
                    to,
                    comment,
                    flagTypeId,
                    runNumber,
                    detectorId,
                    externalUserId,
                    effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
                }).to.be.eql({
                    from: qcFlag.from,
                    to: qcFlag.to,
                    comment: qcFlag.comment,
                    flagTypeId: qcFlag.flagTypeId,
                    runNumber: scope.runNumber,
                    detectorId: scope.detectorIdentifier.detectorId,
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
                        detectorId: scope.detectorIdentifier.detectorId,
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
                    detectorIdentifier: { detectorId: 1 },
                };

                const relations = { user: { roles: ['admin'], externalUserId: 456 } };

                const [{ id, runNumber, dplDetectorId: detectorId }] = await qcFlagService.create([qcFlag], scope, relations);

                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber,
                        detectorId,
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
                        id: createdQcFlags[0].id,
                        effectivePeriods: [],
                    },
                    {
                        id: createdQcFlags[1].id,
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

        it('should successfully create quality control flag without timestamps', async () => {
            const qcFlag = {
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                dataPassIdentifier: { id: 1 },
                detectorIdentifier: { detectorId: 1 },
            };
            const relations = { user: { roles: ['det-cpv'], externalUserId: 456 } };

            const [
                { id, from, to, comment, flagTypeId, runNumber,
                    dplDetectorId: detectorId, createdBy: { externalId: externalUserId }, createdAt },
            ] = await qcFlagService.create([qcFlag], scope, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, detectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                detectorId: scope.detectorIdentifier.detectorId,
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
                        detectorId,
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

        it('should handle flag creation for run with missing timestamps', async () => {
            const relations = { user: { roles: ['admin'], externalUserId: 456 } };
            const flagTypeId = 5;
            const runNumber = 654321;
            const detectorId = 1; // CPV - It's also Id of detector
            const dataPassId = 1;
            await runService.create({ runNumber });
            const run = await RunRepository.findOne({ where: { runNumber } }); // Create run without timestamps
            await run.addDataPass(dataPassId);
            await run.addDetector(detectorId);
            let from;
            let to;
            let qcFlag;
            let effectivePeriods;
            let qcSummary;
            const createdFlagIds = [];

            // 1
            {
                from = null;
                to = null;
                [qcFlag] = await qcFlagService.create(
                    [{ flagTypeId, from, to }],
                    {
                        runNumber,
                        dataPassIdentifier: { id: dataPassId },
                        detectorIdentifier: { detectorId },
                    },
                    relations,
                );
                effectivePeriods = await getEffectivePeriodsOfQcFlag(qcFlag.id);
                createdFlagIds.push(qcFlag.id);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to.be.eql([{ from, to }]);

                qcSummary = await qcFlagService.getQcFlagsSummary({ dataPassId });
                expect(qcSummary).to.be.eql({
                    106: {
                        1: {
                            badEffectiveRunCoverage: 1,
                            mcReproducible: false,
                            missingVerificationsCount: 1,
                            explicitlyNotBadEffectiveRunCoverage: 0,
                            qualityNotDefinedEffectiveRunCoverage: 0,
                        },
                        16: {
                            badEffectiveRunCoverage: 0,
                            explicitlyNotBadEffectiveRunCoverage: 1,
                            mcReproducible: false,
                            missingVerificationsCount: 1,
                            qualityNotDefinedEffectiveRunCoverage: 0,
                        },
                    },
                    [runNumber]: {
                        [detectorId]: {
                            badEffectiveRunCoverage: 1,
                            mcReproducible: true,
                            missingVerificationsCount: 1,
                            explicitlyNotBadEffectiveRunCoverage: 0,
                            qualityNotDefinedEffectiveRunCoverage: 0,
                        },
                    },
                });
            }

            // 2
            {
                from = null;
                to = new Date('2024-07-01 12:00:00').getTime();
                [qcFlag] = await qcFlagService.create(
                    [{ flagTypeId, from, to }],
                    {
                        runNumber,
                        dataPassIdentifier: { id: dataPassId },
                        detectorIdentifier: { detectorId },
                    },
                    relations,
                );
                effectivePeriods = await getEffectivePeriodsOfQcFlag(qcFlag.id);
                createdFlagIds.push(qcFlag.id);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to.have.all.deep.members([{ from, to }]);

                // Previous: first flag
                effectivePeriods = await getEffectivePeriodsOfQcFlag(createdFlagIds[0]);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to.have.all.deep.members([{ from: to, to: null }]);

                qcSummary = await qcFlagService.getQcFlagsSummary({ dataPassId });
                expect(qcSummary).to.be.eql({
                    106: {
                        1: {
                            badEffectiveRunCoverage: 1,
                            mcReproducible: false,
                            missingVerificationsCount: 1,
                            explicitlyNotBadEffectiveRunCoverage: 0,
                            qualityNotDefinedEffectiveRunCoverage: 0,
                        },
                        16: {
                            badEffectiveRunCoverage: 0,
                            explicitlyNotBadEffectiveRunCoverage: 1,
                            mcReproducible: false,
                            missingVerificationsCount: 1,
                            qualityNotDefinedEffectiveRunCoverage: 0,
                        },
                    },
                    [runNumber]: {
                        [detectorId]: {
                            badEffectiveRunCoverage: null,
                            explicitlyNotBadEffectiveRunCoverage: 0,
                            mcReproducible: true,
                            missingVerificationsCount: 2,
                            qualityNotDefinedEffectiveRunCoverage: null,
                        },
                    },
                });
            }

            // 3
            {
                from = new Date('2024-07-01 16:00:00').getTime();
                to = null;
                [qcFlag] = await qcFlagService.create(
                    [{ flagTypeId, from, to }],
                    {
                        runNumber,
                        dataPassIdentifier: { id: dataPassId },
                        detectorIdentifier: { detectorId },
                    },
                    relations,
                );
                effectivePeriods = await getEffectivePeriodsOfQcFlag(qcFlag.id);
                createdFlagIds.push(qcFlag.id);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to.be.eql([{ from, to }]);

                // Previous: first flag
                effectivePeriods = await getEffectivePeriodsOfQcFlag(createdFlagIds[0]);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to
                    .have.all.deep.members([{ from: new Date('2024-07-01 12:00:00').getTime(), to: new Date('2024-07-01 16:00:00').getTime() }]);

                // Previous: second flag
                effectivePeriods = await getEffectivePeriodsOfQcFlag(createdFlagIds[1]);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to
                    .have.all.deep.members([{ from: null, to: new Date('2024-07-01 12:00:00').getTime() }]);
            }

            // 4
            {
                from = new Date('2024-07-01 13:00:00').getTime();
                to = new Date('2024-07-01 15:00:00').getTime();
                [qcFlag] = await qcFlagService.create(
                    [{ flagTypeId, from, to }],
                    {
                        runNumber,
                        dataPassIdentifier: { id: dataPassId },
                        detectorIdentifier: { detectorId },
                    },
                    relations,
                );
                effectivePeriods = await getEffectivePeriodsOfQcFlag(qcFlag.id);
                createdFlagIds.push(qcFlag.id);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to.be.eql([{ from, to }]);

                // Previous: first flag
                effectivePeriods = await getEffectivePeriodsOfQcFlag(createdFlagIds[0]);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to
                    .have.all.deep.members([
                        { from: new Date('2024-07-01 12:00:00').getTime(), to: new Date('2024-07-01 13:00:00').getTime() },
                        { from: new Date('2024-07-01 15:00:00').getTime(), to: new Date('2024-07-01 16:00:00').getTime() },
                    ]);

                // Previous: second flag
                effectivePeriods = await getEffectivePeriodsOfQcFlag(createdFlagIds[1]);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to
                    .have.all.deep.members([{ from: null, to: new Date('2024-07-01 12:00:00').getTime() }]);

                // Previous: third flag
                effectivePeriods = await getEffectivePeriodsOfQcFlag(createdFlagIds[2]);
                expect(effectivePeriods.map(({ from, to }) => ({ from, to }))).to
                    .have.all.deep.members([{ from: new Date('2024-07-01 16:00:00').getTime(), to: null }]);
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 }, // CPV
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 },
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
                detectorIdentifier: { detectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            await assert.rejects(
                () => qcFlagService.create([qcFlag], scope, relations),
                // eslint-disable-next-line max-len
                new BadParameterError('Simulation pass with this id (9999) could not be found'),
            );
        });

        it('should successfully create quality control flag with externalUserId', async () => {
            const qcFlag = {
                from: new Date('2019-08-09 01:29:50').getTime(),
                to: new Date('2019-08-09 05:40:00').getTime(),
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassIdentifier: { id: 1 },
                detectorIdentifier: { detectorId: 1 },
            };
            const relations = { user: { roles: ['det-cpv'], externalUserId: 456 } };

            const [{ id, from, to, comment, flagTypeId, runNumber, dplDetectorId: detectorId, createdBy: { externalId: externalUserId } }] =
                await qcFlagService.create([qcFlag], scope, relations);

            expect({
                from,
                to,
                comment,
                flagTypeId,
                runNumber,
                detectorId,
                externalUserId,
                effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
            }).to.be.eql({
                from: qcFlag.from,
                to: qcFlag.to,
                comment: qcFlag.comment,
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                detectorId: scope.detectorIdentifier.detectorId,
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
                        detectorId,
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

        it('should successfully create quality control flag without timestamps', async () => {
            const qcFlagCreationParameters = {
                comment: 'VERY INTERESTING REMARK',
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                simulationPassIdentifier: { id: 1 },
                detectorIdentifier: { detectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 456 } };

            const [{ id, from, to, comment, flagTypeId, runNumber, dplDetectorId: detectorId, createdBy: { externalId: externalUserId } }] =
                await qcFlagService.create([qcFlagCreationParameters], scope, relations);

            const { startTime, endTime } = await RunRepository.findOne({ where: { runNumber } });

            expect({ from, to, comment, flagTypeId, runNumber, detectorId, externalUserId }).to.be.eql({
                from: startTime,
                to: endTime,
                comment: qcFlagCreationParameters.comment,
                flagTypeId: qcFlagCreationParameters.flagTypeId,
                runNumber: scope.runNumber,
                detectorId: scope.detectorIdentifier.detectorId,
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
                detectorId: 1,
            };

            const relations = { user: { roles: ['admin'], externalUserId: 1 } };

            await assert.rejects(
                () => qcFlagService.create({}, scope, relations),
                new BadParameterError('Cannot create QC flag for data pass and simulation pass simultaneously'),
            );
        });
    });

    describe('Creating synchronous Quality Control Flag', () => {
        it('should successfully create quality control flag', async () => {
            const allOtherQcFlag = await QcFlagRepository.findAll({
                include: [
                    { association: 'dataPasses' },
                    { association: 'simulationPasses' },
                    { association: 'effectivePeriods' },
                ] });

            const qcFlag = {
                from: null,
                to: null,
                flagTypeId: 2,
            };

            const scope = {
                runNumber: 106,
                detectorIdentifier: { detectorId: 1 },
            };
            const relations = { user: { roles: ['det-cpv'], externalUserId: 456 } };

            const [{ id, from, to, flagTypeId, runNumber, dplDetectorId: detectorId, createdBy: { externalId: externalUserId } }] =
                await qcFlagService.create([qcFlag], scope, relations);

            expect({
                flagTypeId,
                runNumber,
                detectorId,
                externalUserId,
                effectivePeriods: await getEffectivePeriodsOfQcFlag(id),
            }).to.be.eql({
                flagTypeId: qcFlag.flagTypeId,
                runNumber: scope.runNumber,
                detectorId: scope.detectorIdentifier.detectorId,
                externalUserId: relations.user.externalUserId,
                effectivePeriods: [{ from, to }],
            });

            const allOtherQcFlagAfterCreation = await QcFlagRepository.findAll({
                where: { id: { [Op.not]: id } },
                include: [
                    { association: 'dataPasses' },
                    { association: 'simulationPasses' },
                    { association: 'effectivePeriods' },
                ] });

            /**
             * Function to extract properties of QC flags to be compared
             * @param {QcFlag} qcFlag flag
             * @return {object} flag properties
             */
            const extractComparableProperties = (qcFlag) => {
                const { id, dataPasses, simulationPasses, effectivePeriods } = qcFlag;
                return {
                    id,
                    dataPassIds: dataPasses.map(({ id }) => id).sort(),
                    simulationPassIds: simulationPasses.map(({ id }) => id).sort(),
                    effectivePeriods: effectivePeriods
                        .map(({ id, from, to }) => ({ id, from, to }))
                        .sort(({ id: idA }, { id: idB }) => idA - idB),
                };
            };

            expect(allOtherQcFlag.map(extractComparableProperties)).to
                .have.all.deep.members(allOtherQcFlagAfterCreation.map(extractComparableProperties));
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

            /**
             * Get unix timestamp for given time on 2024-07-10
             * Used to avoid code below to be padded out
             *
             * @param {string} timeString time string in hh:mm:ss format
             * @return {number} unix timestamp
             */
            const t = (timeString) => new Date(`2024-07-16 ${timeString}`).getTime();

            const runNumber = 445566;
            const dataPassId = 3;
            const timeTrgStart = t('06:00:00');
            const timeTrgEnd = t('22:00:00');

            await runService.create({ runNumber, timeTrgStart, timeTrgEnd });
            const run = await RunRepository.findOne({ where: { runNumber } });
            const detectorId = 1;
            await run.addDataPass(dataPassId);
            await run.addDetector(detectorId);

            // Creating flags fo CPV
            const scope = {
                runNumber,
                dataPassIdentifier: { id: dataPassId },
                detectorIdentifier: { detectorId: 1 },
            };
            const relations = { user: { roles: ['admin'], externalUserId: 456 } };
            const goodFlagTypeId = 3;

            const [{ id: id1 }] = await qcFlagService
                .create([{ flagTypeId: goodFlagTypeId, from: t('08:00:00'), to: t('20:00:00') }], scope, relations);
            const [{ id: id2 }] = await qcFlagService
                .create([{ flagTypeId: goodFlagTypeId, from: t('10:00:00'), to: t('18:00:00') }], scope, relations);
            const [{ id: id3 }] = await qcFlagService
                .create([{ flagTypeId: goodFlagTypeId, from: t('12:00:00'), to: t('16:00:00') }], scope, relations);
            const [{ id: id4 }] = await qcFlagService
                .create([{ flagTypeId: goodFlagTypeId, from: t('13:30:00'), to: t('14:30:00') }], scope, relations);
            expect(await getEffectivePeriodsOfQcFlag(id1)).to.have.all.deep.members([
                { from: t('08:00:00'), to: t('10:00:00') },
                { from: t('18:00:00'), to: t('20:00:00') },
            ]);
            expect(await getEffectivePeriodsOfQcFlag(id2)).to.have.all.deep.members([
                { from: t('10:00:00'), to: t('12:00:00') },
                { from: t('16:00:00'), to: t('18:00:00') },
            ]);
            expect(await getEffectivePeriodsOfQcFlag(id3)).to.have.all.deep.members([
                { from: t('12:00:00'), to: t('13:30:00') },
                { from: t('14:30:00'), to: t('16:00:00') },
            ]);
            expect(await getEffectivePeriodsOfQcFlag(id4)).to.have.all.deep.members([{ from: t('13:30:00'), to: t('14:30:00') }]);

            await qcFlagService.delete(id3);
            expect(await getEffectivePeriodsOfQcFlag(id1)).to.have.all.deep.members([
                { from: t('08:00:00'), to: t('10:00:00') },
                { from: t('18:00:00'), to: t('20:00:00') },
            ]);
            expect(await getEffectivePeriodsOfQcFlag(id2)).to.have.all.deep.members([
                { from: t('10:00:00'), to: t('13:30:00') },
                { from: t('14:30:00'), to: t('18:00:00') },
            ]);
            expect(await getEffectivePeriodsOfQcFlag(id4)).to.have.all.deep.members([{ from: t('13:30:00'), to: t('14:30:00') }]);

            await qcFlagService.delete(id4);
            expect(await getEffectivePeriodsOfQcFlag(id1)).to.have.all.deep.members([
                { from: t('08:00:00'), to: t('10:00:00') },
                { from: t('18:00:00'), to: t('20:00:00') },
            ]);
            expect(await getEffectivePeriodsOfQcFlag(id2)).to.have.all.deep.members([{ from: t('10:00:00'), to: t('18:00:00') }]);
        });

        it('should successfully delete QC flag of simulationPass ', async () => {
            const scope = {
                runNumber: 106,
                simulationPassIdentifier: { id: 1 },
                detectorIdentifier: { detectorId: 1 },
            };

            const relations = { user: { roles: ['admin'], externalUserId: 1 } };

            const [{ id, createdAt }] = await qcFlagService.create([{ flagTypeId: 2 }], scope, relations);

            {
                const olderFlags = (await QcFlagRepository.findAll({
                    where: {
                        runNumber: 106,
                        detectorId: 1,
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
                        detectorId: 1,
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
        it('should successfully verify QC flag when not being owner', async () => {
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

    describe('Fetch GAQ', () => {
        /**
         * Get unix timestamp for given time on 2024-07-10
         * Used to avoid code below to be padded out
         *
         * @param {string} timeString time string in hh:mm:ss format
         * @return {number} unix timestamp
         */
        const t = (timeString) => new Date(`2024-07-10 ${timeString}`).getTime();

        const relations = { user: { roles: ['admin'], externalUserId: 456 } };
        const goodFlagTypeId = 3;
        const badPidFlagTypeId = 12;
        const limitedAccMCTypeId = 5;

        it('should successfully get GAQ flags', async () => {
            const dataPassId = 3;

            const runNumber = 334455;
            const timeTrgStart = t('06:00:00');
            const timeTrgEnd = t('22:00:00');

            await runService.create({ runNumber, timeTrgStart, timeTrgEnd });
            const run = await RunRepository.findOne({ where: { runNumber } });
            const detectorIds = [1, 2, 3];
            await run.addDataPass(dataPassId);
            await run.addDetectors(detectorIds);
            await gaqDetectorService.setGaqDetectors(dataPassId, [runNumber], detectorIds);

            // Creating flags fo CPV, EMC, FDD
            const scope = {
                runNumber,
                dataPassIdentifier: { id: dataPassId },
            };
            const scopeCPV = { ...scope, detectorIdentifier: { detectorId: 1 } };
            const scopeEMC = { ...scope, detectorIdentifier: { detectorId: 2 } };
            const scopeFDD = { ...scope, detectorIdentifier: { detectorId: 3 } };

            const cpvFlagIds = (await qcFlagService.create([
                { from: t('06:00:00'), to: t('16:00:00'), flagTypeId: goodFlagTypeId },
                { from: t('06:00:00'), to: t('14:00:00'), flagTypeId: badPidFlagTypeId },
                { from: t('10:00:00'), to: t('14:00:00'), flagTypeId: limitedAccMCTypeId },
                { from: t('18:00:00'), to: t('22:00:00'), flagTypeId: goodFlagTypeId },
            ], scopeCPV, relations)).map(({ id }) => id);

            const emcFlagIds = (await qcFlagService.create([
                { from: t('06:00:00'), to: t('10:00:00'), flagTypeId: goodFlagTypeId },
                { from: t('10:00:00'), to: t('12:00:00'), flagTypeId: badPidFlagTypeId },
                { from: t('12:00:00'), to: t('13:00:00'), flagTypeId: limitedAccMCTypeId },
                { from: t('14:00:00'), to: t('16:00:00'), flagTypeId: goodFlagTypeId },
                { from: t('18:00:00'), to: t('20:00:00'), flagTypeId: goodFlagTypeId },
            ], scopeEMC, relations)).map(({ id }) => id);

            const fddFlagIds = (await qcFlagService.create([
                { from: t('10:00:00'), to: t('16:00:00'), flagTypeId: badPidFlagTypeId },
                { from: t('10:00:00'), to: t('14:00:00'), flagTypeId: goodFlagTypeId },
            ], scopeFDD, relations)).map(({ id }) => id);

            const gaqFlags = await qcFlagService.getGaqFlags(dataPassId, runNumber);
            const data = gaqFlags.map(({
                from,
                to,
                contributingFlags,
            }) => ({
                from,
                to,
                contributingFlagIds: contributingFlags.map(({ id }) => id).sort((id1, id2) => id1 - id2),
            }));

            expect(data).to.have.all.deep.ordered.members([
                { from: t('06:00:00'), to: t('10:00:00'), contributingFlagIds: [cpvFlagIds[1], emcFlagIds[0]] },
                { from: t('10:00:00'), to: t('12:00:00'), contributingFlagIds: [cpvFlagIds[2], emcFlagIds[1], fddFlagIds[1]] },
                { from: t('12:00:00'), to: t('13:00:00'), contributingFlagIds: [cpvFlagIds[2], emcFlagIds[2], fddFlagIds[1]] },
                { from: t('13:00:00'), to: t('14:00:00'), contributingFlagIds: [cpvFlagIds[2], fddFlagIds[1]] },
                { from: t('14:00:00'), to: t('16:00:00'), contributingFlagIds: [cpvFlagIds[0], emcFlagIds[3], fddFlagIds[0]] },
                { from: t('16:00:00'), to: t('18:00:00'), contributingFlagIds: [] },
                { from: t('18:00:00'), to: t('20:00:00'), contributingFlagIds: [cpvFlagIds[3], emcFlagIds[4]] },
                { from: t('20:00:00'), to: t('22:00:00'), contributingFlagIds: [cpvFlagIds[3]] },
            ]);
            expect(gaqFlags.every(({ contributingFlags }) => contributingFlags
                .every(({ flagType, createdBy, verifications }) => flagType && createdBy && verifications))).to.be.true;
        });

        it('should successfully get GAQ summary', async () => {
            const dataPassId = 3;

            const runNumber = 334455;
            const timeTrgStart = t('06:00:00');
            const timeTrgEnd = t('22:00:00');

            const gaqSubSummaries = [
                { from: t('06:00:00'), to: t('10:00:00'), bad: null, mcReproducible: false },
                { from: t('10:00:00'), to: t('12:00:00'), bad: true, mcReproducible: false },
                { from: t('12:00:00'), to: t('13:00:00'), bad: true, mcReproducible: true },
                { from: t('13:00:00'), to: t('14:00:00'), bad: null, mcReproducible: true },
                { from: t('14:00:00'), to: t('16:00:00'), bad: true, mcReproducible: false },
                { from: t('16:00:00'), to: t('18:00:00'), bad: null, mcReproducible: false },
                { from: t('18:00:00'), to: t('20:00:00'), bad: null, mcReproducible: false },
                { from: t('20:00:00'), to: t('22:00:00'), bad: null, mcReproducible: false },
            ];

            const expectedGaqSummary = gaqSubSummaries.reduce((acc, { from, to, bad, mcReproducible }) => {
                if (bad === null) {
                    acc.qualityNotDefinedEffectiveRunCoverage += to - from;
                } else if (bad) {
                    acc.badEffectiveRunCoverage += to - from;
                } else {
                    acc.explicitlyNotBadEffectiveRunCoverage += to - from;
                }
                acc.mcReproducible = acc.mcReproducible || mcReproducible;
                return acc;
            }, { badEffectiveRunCoverage: 0, explicitlyNotBadEffectiveRunCoverage: 0, qualityNotDefinedEffectiveRunCoverage: 0 });
            expectedGaqSummary.badEffectiveRunCoverage /= timeTrgEnd - timeTrgStart;
            expectedGaqSummary.explicitlyNotBadEffectiveRunCoverage /= timeTrgEnd - timeTrgStart;
            expectedGaqSummary.qualityNotDefinedEffectiveRunCoverage /= timeTrgEnd - timeTrgStart;
            expectedGaqSummary.missingVerificationsCount = 11;

            const { [runNumber]: runGaqSummary } = await qcFlagService.getGaqSummary(dataPassId);
            expect(runGaqSummary).to.be.eql(expectedGaqSummary);

            const scope = {
                runNumber: 56,
                dataPassIdentifier: { id: dataPassId },
            };

            const ft0Id = 7;
            const itsId = 4;

            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: goodFlagTypeId }],
                { ...scope, detectorIdentifier: { detectorId: ft0Id } },
                relations,
            );
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: goodFlagTypeId }],
                { ...scope, detectorIdentifier: { detectorId: itsId } },
                relations,
            );

            scope.runNumber = 54;
            await qcFlagService.create(
                [{ from: null, to: null, flagTypeId: badPidFlagTypeId }],
                { ...scope, detectorIdentifier: { detectorId: itsId } },
                relations,
            );

            const gaqSummary = await qcFlagService.getGaqSummary(dataPassId);
            expect(gaqSummary).to.be.eql({
                [runNumber]: expectedGaqSummary,
                56: {
                    missingVerificationsCount: 2,
                    explicitlyNotBadEffectiveRunCoverage: 1,
                    badEffectiveRunCoverage: 0,
                    mcReproducible: false,
                    qualityNotDefinedEffectiveRunCoverage: 0,
                },
                54: {
                    missingVerificationsCount: 1,
                    explicitlyNotBadEffectiveRunCoverage: 0,
                    badEffectiveRunCoverage: 1,
                    mcReproducible: false,
                    qualityNotDefinedEffectiveRunCoverage: 0,
                },
            });
        });
    });
};
