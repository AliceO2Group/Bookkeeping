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

const { run: { GetAllRunsUseCase } } = require('../../../lib/usecases');
const { dtos: { GetAllRunsDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllRunsDto;

    beforeEach(async () => {
        getAllRunsDto = await GetAllRunsDto.validateAsync({});
    });

    it('should return an array', async () => {
        const { runs } = await new GetAllRunsUseCase()
            .execute();

        expect(runs).to.be.an('array');
    });

    it('should return an array limited to default 100 with runs', async () => {
        getAllRunsDto.query = {};
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(100);
    });

    it('should return an array, only containing runs with specified run number', async () => {
        getAllRunsDto.query = { filter: { runNumbers: '17,18' } };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);
        expect(runs[0].runNumber).to.equal(18); // Default sorting order is dsc
        expect(runs[1].runNumber).to.equal(17);
    });

    it('should return an array, only containing found runs from passed list (run numbers can be missing or non-numbers)', async () => {
        getAllRunsDto.query = { filter: { runNumbers: '-2,17, ,400,18' } };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);
        expect(runs[0].runNumber).to.equal(18); // Default sorting order is dsc
        expect(runs[1].runNumber).to.equal(17);
    });

    it('should successfully filter on run definition', async () => {
        const PHYSICS_COUNT = 4;
        const COSMIC_COUNT = 2;
        const TECHNICAL_COUNT = 1;
        const SYNTHETIC_COUNT = 1;

        getAllRunsDto.query = { filter: { definitions: 'PHYSICS' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(PHYSICS_COUNT);
            expect(runs.every(({ definition }) => definition === 'PHYSICS')).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: 'COSMIC' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(COSMIC_COUNT);
            expect(runs.every(({ definition }) => definition === 'COSMIC')).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: 'SYNTHETIC' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(SYNTHETIC_COUNT);
            expect(runs.every(({ definition }) => definition === 'SYNTHETIC')).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: 'TECHNICAL' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(TECHNICAL_COUNT);
            expect(runs.every(({ definition }) => definition === 'TECHNICAL')).to.be.true;
        }

        getAllRunsDto.query = { filter: { definitions: 'PHYSICS, COSMIC' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(PHYSICS_COUNT + COSMIC_COUNT);
            expect(runs.every(({ definition }) => definition === 'PHYSICS' || definition === 'COSMIC')).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: 'TECHNICAL, SYNTHETIC' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(TECHNICAL_COUNT + SYNTHETIC_COUNT);
            expect(runs.every(({ definition }) => definition === 'TECHNICAL' || definition === 'SYNTHETIC')).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: 'PHYSICS, SYNTHETIC, COSMIC, TECHNICAL' } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(PHYSICS_COUNT + COSMIC_COUNT + SYNTHETIC_COUNT + TECHNICAL_COUNT);
            const any = ['PHYSICS', 'COSMIC', 'SYNTHETIC', 'TECHNICAL'];
            expect(runs.every(({ definition }) => any.includes(definition))).to.be.true;
        }
    });

    it('should successfully return an array, only containing runs with given fill numbers', async () => {
        getAllRunsDto.query = {
            filter: {
                fillNumbers: '-1,1, , 3,10',
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(4);
        expect(runs.every((run) => [1, 3].includes(run.fillNumber))).to.be.true;
    });

    it('should successfully return an empty array of runs for invalid fill numbers', async () => {
        getAllRunsDto.query = {
            filter: {
                fillNumbers: 'DO-NOT-EXISTS',
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(0);
    });

    it('should return an array, only containing runs with dcs true', async () => {
        getAllRunsDto.query = { filter: { dcs: true } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(7);
    });

    it('should return an array with specified limit, only containing runs with dcs false or null', async () => {
        getAllRunsDto.query = { filter: { dcs: false }, page: { limit: 15 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(15);
    });

    it('should return an array with only runs with dd_flp false or null', async () => {
        getAllRunsDto.query = { filter: { ddflp: false }, page: { limit: 25 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(8);
    });

    it('should return an array only containing runs with ddflp true', async () => {
        getAllRunsDto.query = { filter: { ddflp: true }, page: { limit: 10, offset: 10 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(10);
        expect(runs[0].runNumber).to.equal(96);
    });

    it('should return an array, only containing runs with epn true', async () => {
        getAllRunsDto.query = { filter: { epn: true } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(100);
    });

    it('should return an array with default limit 100, only containing runs with epn false or null', async () => {
        getAllRunsDto.query = { filter: { epn: false } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);
    });

    it('should return an array with runs on certain timestamps', async () => {
        getAllRunsDto.query = {
            filter: {
                o2start: {
                    from: 1647730800000,
                    to: 1648162799999,
                },
                o2end: {
                    from: 1647781200000,
                    to: 1648162799999,
                },
            },
        };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);
        expect(runs[0].runNumber).to.equal(1);
    });

    it('should return an array with only from values given', async () => {
        getAllRunsDto.query = {
            filter: {
                o2start: {
                    from: 1647730800000,
                },
                o2end: {
                    from: 1647781200000,
                },
            },
        };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);
        expect(runs[0].runNumber).to.equal(1);
    });

    it('should return an array with only to values given', async () => {
        getAllRunsDto.query = {
            filter: {
                o2start: {
                    to: 1648162799999,
                },
                o2end: {
                    to: 1648162799999,
                },
            },
        };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(100);
    });

    it('should successfully filter on duration', async () => {
        const runDuration = {
            operator: '<',
            limit: 0,
        };
        getAllRunsDto.query = { filter: { runDuration } };

        const getAllRunsUseCase = new GetAllRunsUseCase();
        let { runs } = await getAllRunsUseCase.execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(0);

        runDuration.operator = '<=';
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs.every((run) => run.runDuration <= 0)).to.be.true;

        // One test run is about 25h, two other are more than 25 hours
        const pivot = 25 * 60 * 60 * 1000;
        runDuration.operator = '=';
        runDuration.limit = pivot;
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);
        expect(runs.every((run) => run.runDuration === pivot)).to.be.true;

        runDuration.operator = '>=';
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');

        expect(runs).to.have.lengthOf(5);
        expect(runs.every((run) => run.runDuration >= pivot)).to.be.true;

        runDuration.operator = '>';
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(4);
        expect(runs.every((run) => run.runDuration > pivot)).to.be.true;
    });

    it('should successfully filter on detectors', async () => {
        getAllRunsDto.query = { filter: { detectors: 'ITS' } };

        let { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(5);

        getAllRunsDto.query = { filter: { detectors: 'ITS   ,   FT0' } };

        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);

        getAllRunsDto.query = { filter: { detectors: 'ITS,FT0' } };

        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);

        getAllRunsDto.query = { filter: { detectors: 'FT0,ITS' } };

        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);
    });

    it('should successfully filter on detectors number', async () => {
        const nDetectors = {
            operator: '<',
            limit: 3,
        };
        getAllRunsDto.query = { filter: { nDetectors } };

        let { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(10);

        nDetectors.operator = '<=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(60);
        expect(runs.every((run) => run.nDetectors <= 3)).to.be.true;

        nDetectors.operator = '=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(50);
        expect(runs.every((run) => run.nDetectors === 3)).to.be.true;

        nDetectors.limit = 6;
        nDetectors.operator = '>=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(46);
        expect(runs.every((run) => run.nDetectors >= 6)).to.be.true;

        nDetectors.operator = '>';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        // 1 run has 15 detectors
        expect(runs).to.have.lengthOf(1);
    });

    it('should successfully filter on flps number', async () => {
        const nFlps = {
            operator: '<',
            limit: 10,
        };
        getAllRunsDto.query = { filter: { nFlps } };

        let { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(0);

        nFlps.operator = '<=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(5);
        expect(runs.every((run) => run.nFlps <= 10)).to.be.true;

        nFlps.operator = '=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(5);
        expect(runs.every((run) => run.nFlps === 10)).to.be.true;

        nFlps.limit = 12;
        nFlps.operator = '>=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        // 100 is the limit per page, true result must be 101
        expect(runs).to.have.lengthOf(100);
        expect(runs.every((run) => run.nFlps >= 12)).to.be.true;

        nFlps.operator = '>';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(0);
    });

    it('should successfully return an array, only containing runs found from passed list', async () => {
        getAllRunsDto.query = {
            filter: {
                environmentIds: '-1,ABCDEFGHIJ, , 0987654321,10',
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(7);
        expect(runs.every((run) => ['0987654321', 'ABCDEFGHIJ'].includes(run.environmentId))).to.be.true;
    });

    it('should successfully return an empty array of runs for invalid environments', async () => {
        getAllRunsDto.query = {
            filter: {
                environmentIds: 'DO-NOT-EXISTS',
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(0);
    });

    it('should successfully return an array containing only runs with specified run qualities', async () => {
        const requiredQualities = ['bad', 'test'];
        getAllRunsDto.query = { filter: { runQualities: requiredQualities }, page: { limit: 100 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(44);
        expect(runs.every((run) => requiredQualities.includes(run.runQuality))).to.be.true;
    });

    it('should successfully return an array containing only runs with specified trigger values', async () => {
        const requiredTriggers = ['OFF', 'CTP'];
        getAllRunsDto.query = { filter: { triggerValues: requiredTriggers }, page: { limit: 100 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(19);
    });
    it('should successfully return an array, only containing runs found with lhc periods filter', async () => {
        getAllRunsDto.query = {
            filter: {
                lhcPeriods: 'lhc22b, lhc22a',
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf.above(1);
    });
    it('should successfully return an array only containing runs found with run type filter', async () => {
        getAllRunsDto.query = {
            filter: {
                runTypes: [14, 2],
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf.above(3);
    });
};
