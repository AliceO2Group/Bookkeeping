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
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const assert = require('assert');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const { dataPassService } = require('../../../../../lib/server/services/dataPasses/DataPassService.js');
const { SkimmingStage } = require('../../../../../lib/domain/enums/SkimmingStage.js');
const DataPassRepository = require('../../../../../lib/database/repositories/DataPassRepository.js');
const RunRepository = require('../../../../../lib/database/repositories/RunRepository.js');
const DataPassVersionRepository = require('../../../../../lib/database/repositories/DataPassVersionRepository.js');
const DataPassRunRepository = require('../../../../../lib/database/repositories/DataPassRunRepository.js');
const { Op } = require('sequelize');

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    pdpBeamTypes: ['pp'],
    skimmingStage: SkimmingStage.SKIMMABLE,
    isFrozen: false,
    versions: [
        {
            id: 1,
            dataPassId: 1,
            description: 'Some random desc',
            reconstructedEventsCount: 50948694,
            outputSize: 56875682112600,
            lastSeen: 108,
            statusHistory: [
                {
                    createdAt: 1704884400000,
                    dataPassVersionId: 1,
                    id: 1,
                    status: 'Running',
                },
                {
                    createdAt: 1704885060000,
                    dataPassVersionId: 1,
                    id: 2,
                    status: 'Deleted',
                },
            ],
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('Fetching', () => {
        it('should successfully get by id', async () => {
            const dataPass = await dataPassService.getByIdentifier({ id: 1 });
            expect(dataPass).to.be.eql(LHC22b_apass1);
        });

        it('should successfully get by name', async () => {
            const dataPass = await dataPassService.getByIdentifier({ name: 'LHC22a_apass1' });
            expect(dataPass.name).to.be.eql('LHC22a_apass1');
        });

        it('should successfully get all data', async () => {
            const { rows: dataPasses } = await dataPassService.getAll();
            expect(dataPasses).to.be.lengthOf(5);
        });

        it('should fail when no Data Pass with given id', async () => {
            await assert.rejects(
                () => dataPassService.getOneOrFail({ id: 99999 }),
                new NotFoundError('Data pass with this id (99999) could not be found'),
            );
        });

        it('should successfully filter data passes on names', async () => {
            const dto = {
                query: {
                    filter: {
                        names: ['LHC22b_apass1'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(1);
            expect(dataPasses[0]).to.be.eql(LHC22b_apass1);
        });

        it('should successfully filter data passes on ids', async () => {
            const dto = {
                query: {
                    filter: {
                        ids: ['1', '2'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(2);
        });

        it('should return null when no Data Pass with given id', async () => {
            expect(await dataPassService.getByIdentifier({ id: 99999 })).to.be.null;
        });

        it('should successfully filter data passes on lhc periods ids', async () => {
            const dto = {
                query: {
                    filter: {
                        lhcPeriodIds: ['2'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(3);
            expect(dataPasses.map(({ name }) => name)).to.have.members(['LHC22b_apass1', 'LHC22b_skimming', 'LHC22b_apass2_skimmed']);
        });

        it('should successfully filter data passes on simulation pass ids', async () => {
            const dto = {
                query: {
                    filter: {
                        simulationPassIds: ['1'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses.map(({ name }) => name)).to.have.all.members(['LHC22b_apass1', 'LHC22b_apass2_skimmed']);
        });

        it('should successfully sort data passes by names', async () => {
            const dto = {
                query: {
                    sort: {
                        name: 'ASC',
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses.map(({ name }) => name)).to.have
                .ordered.members(['LHC22a_apass1', 'LHC22a_apass2', 'LHC22b_apass1', 'LHC22b_apass2_skimmed', 'LHC22b_skimming']);
        });
    });

    describe('Skimming', () => {
        it('should throw when calling for data pass of PbPb runs', async () => {
            await assert.rejects(
                () => dataPassService.markAsSkimmable({ name: 'LHC22a_apass1' }),
                new NotFoundError('Cannot mark LHC22a_apass1 as skimmable.' +
                    ' Only production for PROTON_PROTON runs can be marked as skimmable'),
            );
        });

        it('should throw when calling for data pass with invalid name', async () => {
            await assert.rejects(
                () => dataPassService.markAsSkimmable({ name: 'LHC22b_skimming' }),
                new NotFoundError('Cannot mark LHC22b_skimming as skimmable.' +
                    ' Only `apass` can be marked as skimmable'),
            );
        });

        it('should successfully mark data pass as skimmable', async () => {
            let newDataPass = await DataPassRepository.insert({ name: 'LHC22b_apass2', lhcPeriodId: 2 });
            const run = await RunRepository.findOne({ where: { runNumber: 106 } });
            await newDataPass.addRun(run);
            await DataPassVersionRepository.insert({ dataPassId: newDataPass.id, description: 'desc for LHC22b apass2' });

            let previousSkimmable = await DataPassRepository.findOne({ where: { name: 'LHC22b_apass1' } });
            expect(previousSkimmable.skimmingStage).to.be.equal(SkimmingStage.SKIMMABLE);

            await dataPassService.markAsSkimmable({ name: 'LHC22b_apass2' });
            previousSkimmable = await DataPassRepository.findOne({ where: { name: 'LHC22b_apass1' } });
            expect(previousSkimmable.skimmingStage).to.be.equal(null);

            newDataPass = await DataPassRepository.findOne({ where: { name: 'LHC22b_apass2' } });
            expect(newDataPass.skimmingStage).to.be.equal(SkimmingStage.SKIMMABLE);

            // Restore skimmable runs flags after changing skimmable data pass
            await dataPassService.markAsSkimmable({ name: 'LHC22b_apass1' });
            await DataPassRunRepository.updateAll(
                { readyForSkimming: true },
                { where: { dataPassId: previousSkimmable.id, runNumber: 106 } },
            );
            await DataPassRunRepository.updateAll(
                { readyForSkimming: false },
                { where: { dataPassId: previousSkimmable.id, runNumber: { [Op.in]: [107, 108] } } },
            );
        });

        it('should successfully fetch runs list with ready_for_skimming information', async () => {
            const data = await dataPassService.getSkimmableRuns({ id: 1 });
            expect(data).to.have.all.deep.members([
                { runNumber: 106, readyForSkimming: true },
                { runNumber: 107, readyForSkimming: false },
                { runNumber: 108, readyForSkimming: false },
            ]);
        });

        it('should successfully update runs with ready_for_skimming information', async () => {
            const newData = [
                { runNumber: 106, readyForSkimming: false },
                { runNumber: 107, readyForSkimming: true },
            ];

            const skimmableRuns = await dataPassService.updateReadyForSkimmingRuns({ id: 1 }, newData);
            expect(skimmableRuns).to.have.all.deep.members(newData);

            expect(await dataPassService.getSkimmableRuns({ id: 1 })).to.have.all.deep.members([
                ...newData,
                { runNumber: 108, readyForSkimming: false },
            ]);
        });
    });

    describe('Updating', () => {
        it('should successfully freeze a given data pass', async () => {
            await dataPassService.setFrozenState({ id: 1 }, true);
            const dataPass = await dataPassService.getByIdentifier({ id: 1 });
            expect(dataPass.isFrozen).to.be.true;
        });

        it('should fail to freeze a not existing data pass', async () => {
            await assert.rejects(
                () => dataPassService.setFrozenState({ name: 'do-not-exist' }, true),
                new NotFoundError('Data pass with this name (do-not-exist) could not be found'),
            );
            await assert.rejects(
                () => dataPassService.setFrozenState({ id: 99999999 }, true),
                new NotFoundError('Data pass with this id (99999999) could not be found'),
            );
        });

        it('should successfully unfreeze a given data pass', async () => {
            await dataPassService.setFrozenState({ id: 1 }, false);
            const dataPass = await dataPassService.getByIdentifier({ id: 1 });
            expect(dataPass.isFrozen).to.be.false;
        });

        it('should fail to unfreeze a not existing data pass', async () => {
            await assert.rejects(
                () => dataPassService.setFrozenState({ name: 'do-not-exist' }, false),
                new NotFoundError('Data pass with this name (do-not-exist) could not be found'),
            );
            await assert.rejects(
                () => dataPassService.setFrozenState({ id: 99999999 }, false),
                new NotFoundError('Data pass with this id (99999999) could not be found'),
            );
        });
    });
};
