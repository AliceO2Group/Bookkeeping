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
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { DetectorType } = require('../../../../../lib/domain/enums/DetectorTypes.js');
const { runService } = require('../../../../../lib/server/services/run/RunService.js');
const DataPassRepository = require('../../../../../lib/database/repositories/DataPassRepository.js');
const RunRepository = require('../../../../../lib/database/repositories/RunRepository.js');
const { Op } = require('sequelize');

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    versions: [
        {
            id: 1,
            dataPassId: 1,
            description: 'Some random desc',
            reconstructedEventsCount: 50948694,
            outputSize: 56875682112600,
            lastSeen: 108,
            deletedFromMonAlisa: true,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

const LHC22b_apass2 = {
    id: 2,
    name: 'LHC22b_apass2',
    versions: [
        {
            id: 2,
            dataPassId: 2,
            description: 'Some random desc 2',
            reconstructedEventsCount: 50848604,
            outputSize: 55765671112610,
            lastSeen: 55,
            deletedFromMonAlisa: false,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

const LHC22a_apass1 = {
    id: 3,
    name: 'LHC22a_apass1',
    versions: [
        {
            id: 3,
            dataPassId: 3,
            description: 'Some random desc for apass 1',
            reconstructedEventsCount: 50848111,
            outputSize: 55761110122610,
            lastSeen: 105,
            deletedFromMonAlisa: false,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 4,
    simulationPassesCount: 2,
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('Fetching', () => {
        it('should succesfully get by id', async () => {
            const dataPass = await dataPassService.getByIdentifier({ id: 1 });
            expect(dataPass).to.be.eql(LHC22b_apass1);
        });

        it('should succesfully get by name', async () => {
            const dataPass = await dataPassService.getByIdentifier({ name: 'LHC22a_apass1' });
            expect(dataPass).to.be.eql(LHC22a_apass1);
        });

        it('should succesfully get all data', async () => {
            const { rows: dataPasses } = await dataPassService.getAll();
            expect(dataPasses).to.be.lengthOf(3);
        });

        it('should fail when no Data Pass with given id', async () => {
            await assert.rejects(
                () => dataPassService.getOneOrFail({ id: 99999 }),
                new NotFoundError('Data pass with this id (99999) could not be found'),
            );
        });

        it('should succesfully filter data passes on names', async () => {
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

        it('should succesfully filter data passes on ids', async () => {
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

        it('should succesfully filter data passes on lhc petriods ids', async () => {
            const dto = {
                query: {
                    filter: {
                        lhcPeriodIds: ['2'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(2);
            expect(dataPasses).to.have.deep.members([LHC22b_apass1, LHC22b_apass2]);
        });

        it('should succesfully filter data passes on simulation pass ids', async () => {
            const dto = {
                query: {
                    filter: {
                        simulationPassIds: ['1'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.have.all.deep.members([LHC22b_apass1, LHC22b_apass2]);
        });

        it('should succesfully sort data passes by names', async () => {
            const dto = {
                query: {
                    sort: {
                        name: 'ASC',
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.have.ordered.deep.members([LHC22a_apass1, LHC22b_apass1, LHC22b_apass2]);
        });
    });
    describe('Manage GAQ detectors', () => {
        const dataPassId = 3;
        it('should successfully set GAQ detectors', async () => {
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const data = await dataPassService.setGaqDetectors(dataPassId, runNumbers, detectorIds);
            expect(data).to.be.have.all.deep.members(runNumbers
                .flatMap((runNumber) => detectorIds.map((detectorId) => ({ dataPassId, runNumber, detectorId }))));
        });
        it('should fail to set GAQ detectors because of missing association', async () => {
            let errorMessage = `No association between data pass with id ${dataPassId} and following runs: 1`;
            assert.rejects(
                () => dataPassService.setGaqDetectors(dataPassId, [1], [4]),
                new BadParameterError(errorMessage),
            );
            errorMessage = `No association between runs and detectors: ${JSON.stringify([[56, 'CPV']])}`;
            assert.rejects(
                () => dataPassService.setGaqDetectors(dataPassId, [105, 56], [1]),
                new BadParameterError(errorMessage),
            );
        });

        it('should get GAQ detectors', async () => {
            const detectors = await dataPassService.getGaqDetectors(3, 56);
            expect(detectors).to.be.an('array');
            expect(detectors).to.be.lengthOf(2);
            expect(detectors).to.have.all.deep.members([
                { id: 7, name: 'FT0', type: DetectorType.PHYSICAL },
                { id: 4, name: 'ITS', type: DetectorType.PHYSICAL },
            ]);
        });

        it('should successfully set default GAQ detectors', async () => {
            /**
             * Default GAQ detectors for runs with given pdpBeamType
             *      pp: ['TPC', 'ITS', 'FT0']
             *      PbPb: ['TPC', 'ITS', 'FT0', 'ZDC']
             */

            const newRuns = [
                { runNumber: 777770, pdpBeamType: 'pp', detectors: ['CPV', 'TPC', 'ITS', 'FT0'].join(',') },
                { runNumber: 777771, pdpBeamType: 'pp', detectors: ['CPV', 'TPC', 'ITS'].join(',') },
                { runNumber: 888880, pdpBeamType: 'PbPb', detectors: ['CPV', 'TPC', 'ITS', 'FT0', 'ZDC'].join(',') },
                { runNumber: 888881, pdpBeamType: 'PbPb', detectors: ['CPV', 'TPC', 'ITS', 'FT0'].join(',') },
            ];
            for (const runData of newRuns) {
                await runService.create(runData);
            }
            const dataPassId = 3;
            const dataPass = await DataPassRepository.findOne({ where: { id: dataPassId } });
            const runNumbers = newRuns.map(({ runNumber }) => runNumber);

            await dataPass.addRuns(await RunRepository.findAll({ where: { runNumber: { [Op.in]: runNumbers } } }));

            await dataPassService.useDefaultGaqDetectors(dataPassId, runNumbers);

            expect((await dataPassService.getGaqDetectors(dataPassId, 777770)).map(({ name }) => name)).to
                .have.all.members(['TPC', 'ITS', 'FT0']);
            expect((await dataPassService.getGaqDetectors(dataPassId, 777771)).map(({ name }) => name)).to
                .have.all.members(['TPC', 'ITS']);
            expect((await dataPassService.getGaqDetectors(dataPassId, 888880)).map(({ name }) => name)).to
                .have.all.members(['TPC', 'ITS', 'FT0', 'ZDC']);
            expect((await dataPassService.getGaqDetectors(dataPassId, 888881)).map(({ name }) => name)).to
                .have.all.members(['TPC', 'ITS', 'FT0']);
        });
    });
};
