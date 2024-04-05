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

const { lhcPeriodStatisticsService } = require('../../../../../lib/server/services/lhcPeriod/LhcPeriodStatisticsService.js');
const { expect } = require('chai');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const assert = require('assert');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

const lhcPeriod_LHC22a = {
    id: 1,
    avgCenterOfMassEnergy: 99.52079923444215,
    lhcPeriod: {
        id: 1,
        name: 'LHC22a',

    },
    beamTypes: ['PbPb', 'pp'],
    distinctEnergies: [
        23.21,
        56.1,
    ],
    runsCount: 3,
    dataPassesCount: 1,
    simulationPassesCount: 2,
};

const lhcPeriod_LHC22b = {
    id: 2,
    avgCenterOfMassEnergy: 1264.9836246503144,
    lhcPeriod: {
        id: 2,
        name: 'LHC22b',

    },
    beamTypes: ['XeXe'],
    distinctEnergies: [55.2],
    runsCount: 1,
    dataPassesCount: 2,
    simulationPassesCount: 1,
};

const lhcPeriod_LHC23f = {
    id: 3,
    avgCenterOfMassEnergy: null,
    lhcPeriod: {
        id: 3,
        name: 'LHC23f',

    },
    beamTypes: [],
    distinctEnergies: [],
    dataPassesCount: 0,
    runsCount: 0,
    simulationPassesCount: 0,
};

module.exports = () => {
    before(resetDatabaseContent);

    it('should succesfully get by id', async () => {
        const lhcPeriod = await lhcPeriodStatisticsService.getByIdentifier({ id: 1 });
        expect(lhcPeriod).to.be.eql(lhcPeriod_LHC22a);
    });

    it('should succesfully get by name', async () => {
        const lhcPeriod = await lhcPeriodStatisticsService.getByIdentifier({ name: 'LHC22a' });
        expect(lhcPeriod).to.be.eql(lhcPeriod_LHC22a);
    });

    it('should succesfully get all data', async () => {
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns();
        expect(lhcPeriods).to.be.lengthOf(3);
    });

    it('should fail when no LHC Period with given id', async () => {
        await assert.rejects(
            () => lhcPeriodStatisticsService.getOneOrFail({ id: 99999 }),
            new NotFoundError('LHC Period with this id (99999) could not be found'),
        );
    });

    it('should succesfully filter period statistics on names', async () => {
        const dto = {
            query: {
                filter: {
                    names: ['LHC22a'],
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(1);
        expect(lhcPeriods[0]).to.be.eql(lhcPeriod_LHC22a);
    });

    it('should succesfully filter period statistics on names given as string', async () => {
        const dto = {
            query: {
                filter: {
                    names: ['LHC22b'],
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(1);
        expect(lhcPeriods[0]).to.be.eql(lhcPeriod_LHC22b);
    });

    it('should succesfully filter period statistics on ids', async () => {
        const dto = {
            query: {
                filter: {
                    ids: ['1', '2'],
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(2);
    });

    it('should return null when no lhc period with given id', async () => {
        expect(await lhcPeriodStatisticsService.getByIdentifier({ id: 99999 })).to.be.null;
    });

    it('should succesfully filter period statistics on year', async () => {
        const dto = {
            query: {
                filter: {
                    years: [2022],
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(2);
        expect(lhcPeriods).to.have.deep.members([lhcPeriod_LHC22a, lhcPeriod_LHC22b]);
    });

    it('should succesfully order period statistics on year', async () => {
        const dto = {
            query: {
                sort: {
                    year: 'ASC',
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(3);
        expect(lhcPeriods[2]).to.be.eql(lhcPeriod_LHC23f);
    });

    it('should succesfully filter period statistics on beamTypes', async () => {
        const dto = {
            query: {
                filter: {
                    beamTypes: ['XeXe'],
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(1);
        expect(lhcPeriods).to.have.deep.members([lhcPeriod_LHC22b]);
    });

    it('should succesfully sort period statistics on beamTypes', async () => {
        const dto = {
            query: {
                sort: {
                    beamTypes: 'ASC',
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodStatisticsService.getAllForPhysicsRuns(dto.query);
        expect(lhcPeriods).to.be.lengthOf(3);
        expect(lhcPeriods).to.have.deep.ordered.members([lhcPeriod_LHC23f, lhcPeriod_LHC22a, lhcPeriod_LHC22b]);
    });
};
