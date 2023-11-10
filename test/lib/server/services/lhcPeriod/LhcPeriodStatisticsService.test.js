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

const lhcPeriod_LHC22b = {
    id: 2,
    avgEnergy: null,
    lhcPeriod: {
        id: 2,
        name: 'LHC22b',
    },
};

const lhcPeriod_LHC22a = {
    avgEnergy: 23.209999084472656,
    id: 1,
    lhcPeriod: {
        id: 1,
        name: 'LHC22a',
    },
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
        expect(lhcPeriods).to.be.lengthOf(2);
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
};
