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
const { simulationPassService } = require('../../../../../lib/server/services/simulationPasses/SimulationPassService.js');

const LHC23k6c = {
    id: 1,
    name: 'LHC23k6c',
    jiraId: 'SIMTICKET-1',
    description: 'Some Random general purpose for LHC23k6c',
    pwg: 'PWGX2',
    requestedEventsCount: 1345555,
    generatedEventsCount: 4316450,
    outputSize: 14013600611699,
};

const LHC23k6b = {
    id: 2,
    name: 'LHC23k6b',
    jiraId: 'SIMTICKET-1',
    description: 'Some Random general purpose for LHC23k6b',
    pwg: 'PWGX1',
    requestedEventsCount: 2345555,
    generatedEventsCount: 54800,
    outputSize: 157000310748,
};

module.exports = () => {
    before(resetDatabaseContent);

    it('should succesfully get by id', async () => {
        const simulationPass = await simulationPassService.getByIdentifier({ id: 1 });
        expect(simulationPass).to.be.eql(LHC23k6c);
    });

    it('should succesfully get by name', async () => {
        const simulationPass = await simulationPassService.getByIdentifier({ name: 'LHC23k6b' });
        expect(simulationPass).to.be.eql(LHC23k6b);
    });

    it('should succesfully get all data', async () => {
        const { rows: simulationPasses } = await simulationPassService.getAll();
        expect(simulationPasses).to.be.lengthOf(2);
    });

    it('should fail when no Simulation Pass with given id', async () => {
        await assert.rejects(
            () => simulationPassService.getOneOrFail({ id: 99999 }),
            new NotFoundError('Simulation Pass with this id (99999) could not be found'),
        );
    });

    it('should succesfully filter simulation passes on names', async () => {
        const dto = {
            query: {
                filter: {
                    names: ['LHC23k6b'],
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.be.lengthOf(1);
        expect(simulationPasses[0]).to.be.eql(LHC23k6b);
    });

    it('should succesfully filter simulation passes on ids', async () => {
        const dto = {
            query: {
                filter: {
                    ids: ['1', '2'],
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.be.lengthOf(2);
    });

    it('should return null when no Simulation Pass with given id', async () => {
        expect(await simulationPassService.getByIdentifier({ id: 99999 })).to.be.null;
    });

    it('should succesfully filter simulation passes on lhc periods ids', async () => {
        const dto = {
            query: {
                filter: {
                    lhcPeriodIds: ['1'],
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.be.lengthOf(1);
        expect(simulationPasses).to.have.deep.members([LHC23k6b]);
    });

    it('should succesfully filter simulation passes on Sata Pass ids', async () => {
        const dto = {
            query: {
                filter: {
                    dataPassIds: ['1'],
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.be.lengthOf(1);
        expect(simulationPasses).to.have.deep.members([LHC23k6c]);
    });

    it('should succesfully sort simulation passes by names', async () => {
        const dto = {
            query: {
                sort: {
                    name: 'ASC',
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.have.ordered.deep.members([LHC23k6b, LHC23k6c]);
    });

    it('should succesfully sort simulation passes by generatedEventsCount', async () => {
        const dto = {
            query: {
                sort: {
                    generatedEventsCount: 'DESC',
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.have.ordered.deep.members([LHC23k6c, LHC23k6b]);
    });

    it('should succesfully sort simulation passes by requestedEventsCount', async () => {
        const dto = {
            query: {
                sort: {
                    requestedEventsCount: 'DESC',
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.have.ordered.deep.members([LHC23k6b, LHC23k6c]);
    });

    it('should succesfully sort simulation passes by outputSize', async () => {
        const dto = {
            query: {
                sort: {
                    outputSize: 'ASC',
                },
            },
        };
        const { rows: simulationPasses } = await simulationPassService.getAll(dto.query);
        expect(simulationPasses).to.have.ordered.deep.members([LHC23k6b, LHC23k6c]);
    });
};
