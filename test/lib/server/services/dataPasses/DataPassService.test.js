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

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    pdpBeamType: 'pp',
    skimmingStage: SkimmingStage.SKIMMABLE,
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
            expect(dataPasses).to.be.lengthOf(2);
            expect(dataPasses.map(({ name }) => name)).to.have.deep.members(['LHC22b_apass1', 'LHC22b_apass2']);
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
            expect(dataPasses.map(({ name }) => name)).to.have.all.deep.members(['LHC22b_apass1', 'LHC22b_apass2']);
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
                .ordered.members(['LHC22a_apass1', 'LHC22a_apass2_skimmed', 'LHC22a_skimming', 'LHC22b_apass1', 'LHC22b_apass2']);
        });
    });

    describe('Skimming', () => {
        it('should successfully mark data pass as skimmable', async () => {
            const dataPass = await dataPassService.getByIdentifier({ id: 1 });
            expect(dataPass).to.be.eql(LHC22b_apass1);
        });
    });
};
