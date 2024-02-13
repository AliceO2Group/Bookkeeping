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

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    description: 'Some random desc',
    reconstructedEventsCount: 50948694,
    outputSize: 56875682112600,
    lastRunNumber: 108,
    runsCount: 0,
};

const LHC22b_apass2 = {
    id: 2,
    name: 'LHC22b_apass2',
    description: 'Some random desc',
    reconstructedEventsCount: 50848604,
    outputSize: 55765671112610,
    lastRunNumber: 55,
    runsCount: 1,
};

const LHC22a_apass1 = {
    id: 3,
    name: 'LHC22a_apass1',
    description: 'Some random desc for apass 1',
    reconstructedEventsCount: 50848111,
    outputSize: 55761110122610,
    lastRunNumber: 105,
    runsCount: 3,
};

module.exports = () => {
    before(resetDatabaseContent);

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
            new NotFoundError('Data Pass with this id (99999) could not be found'),
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

    it('should succesfully sort data passes by reconstructedEventsCount', async () => {
        const dto = {
            query: {
                sort: {
                    reconstructedEventsCount: 'DESC',
                },
            },
        };
        const { rows: dataPasses } = await dataPassService.getAll(dto.query);
        expect(dataPasses).to.have.ordered.deep.members([LHC22b_apass1, LHC22b_apass2, LHC22a_apass1]);
    });

    it('should succesfully sort data passes by outputSize', async () => {
        const dto = {
            query: {
                sort: {
                    outputSize: 'ASC',
                },
            },
        };
        const { rows: dataPasses } = await dataPassService.getAll(dto.query);
        expect(dataPasses).to.have.ordered.deep.members([LHC22a_apass1, LHC22b_apass2, LHC22b_apass1]);
    });
};
