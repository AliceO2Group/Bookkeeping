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

const { run: { GetAllRunsUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { GetAllRunsDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');
const { RunQualities } = require('../../../../lib/domain/enums/RunQualities.js');
const { RunCalibrationStatus } = require('../../../../lib/domain/enums/RunCalibrationStatus.js');
const { RunDefinition } = require('../../../../lib/domain/enums/RunDefinition.js');

const { expect } = chai;

module.exports = () => {
    let getAllRunsDto;

    beforeEach(async () => {
        getAllRunsDto = await GetAllRunsDto.validateAsync({});
    });

    it('should return an array', async () => {
        const { runs } = await new GetAllRunsUseCase().execute();

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

    it('should return an array, only containing runs with specified run number and ranges', async () => {
        getAllRunsDto.query = { filter: { runNumbers: '1-5,8,12,20-30' } };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(18);
    });

    it('should return runs sorted by runNumber', async () => {
        {
            const { runs } = await new GetAllRunsUseCase().execute({ query: { sort: { runNumber: 'ASC' } } });

            expect(runs).to.be.an('array');
            expect(runs).to.have.length.greaterThan(1);
            const runNumbers = runs.map(({ runNumber }) => runNumber);
            expect(runNumbers).to.have.all.ordered.members([...runNumbers].sort((a, b) => a - b));
        }
        {
            const { runs } = await new GetAllRunsUseCase().execute({ query: { sort: { runNumber: 'DESC' } } });

            expect(runs).to.be.an('array');
            expect(runs).to.have.length.greaterThan(1);
            const runNumbers = runs.map(({ runNumber }) => runNumber);
            expect(runNumbers).to.have.all.ordered.members([...runNumbers].sort((a, b) => b - a));
        }
    });

    it('should return an array, only containing runs containing the specified run number', async () => {
        getAllRunsDto.query = { filter: { runNumbers: '5' } };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(20);
        expect(runs[0].runNumber).to.equal(105); // Default sorting order is dsc
        expect(runs[1].runNumber).to.equal(95);
    });

    it('should return an array, only containing found runs from passed list (run numbers can be missing or non-numbers)', async () => {
        getAllRunsDto.query = { filter: { runNumbers: '-2,17, ,400,18' } };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);
        expect(runs[0].runNumber).to.equal(18); // Default sorting order is dsc
        expect(runs[1].runNumber).to.equal(17);
    });

    it('should successfully return a list of runs with their detectors, sorted alphabetically', async () => {
        getAllRunsDto.query = { filter: { runNumbers: '106' } };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);
        const [{ detectors }] = runs;
        expect(detectors).to.equal('ACO,CPV,CTP,EMC,FIT,HMP,ITS,MCH,MFT,MID,PHS,TOF,TPC,TRD,ZDC');
    });

    it('should successfully return a list of runs with the specified calibration status', async () => {
        {
            getAllRunsDto.query = { filter: { calibrationStatuses: [RunCalibrationStatus.NO_STATUS] } };
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.lengthOf(1);
            const [{ calibrationStatus }] = runs;
            expect(calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
        }

        {
            getAllRunsDto.query = { filter: { calibrationStatuses: [RunCalibrationStatus.NO_STATUS, RunCalibrationStatus.FAILED] } };
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.lengthOf(1);
            const [{ calibrationStatus }] = runs;
            expect(calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
        }

        {
            getAllRunsDto.query = { filter: { calibrationStatuses: [RunCalibrationStatus.FAILED] } };
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.lengthOf(0);
        }

        {
            getAllRunsDto.query = { filter: { calibrationStatuses: [] } };
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.lengthOf(0);
        }
    });

    it('should successfully filter on tags', async () => {
        {
            getAllRunsDto.query = {
                filter: {
                    tags: { operation: 'and', values: ['FOOD', 'RUN'] },
                },
            };
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.lengthOf(1);
            const [run] = runs;
            const tagTexts = run.tags.map(({ text }) => text);
            expect(tagTexts.includes('FOOD') && tagTexts.includes('RUN')).to.be.true;
        }
        {
            getAllRunsDto.query = {
                filter: {
                    tags: { operation: 'or', values: ['FOOD', 'TEST-TAG-41'] },
                },
            };
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.lengthOf(2);
            for (const run of runs) {
                expect(run.tags.some(({ text }) => text.includes('FOOD') || text.includes('TEST-TAG-41'))).to.be.true;
            }

            {
                getAllRunsDto.query = {
                    filter: {
                        tags: { operation: 'none-of', values: ['FOOD', 'TEST-TAG-41'] },
                    },
                    page: {
                        limit: 200,
                    },
                };
                const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
                expect(runs).to.lengthOf(106);
                for (const run of runs) {
                    expect(run.tags.every(({ text }) => text !== 'FOOD' && text !== 'TEST-TAG-41')).to.be.true;
                }
            }
        }
    });

    it('should successfully filter on run definition', async () => {
        const PHYSICS_COUNT = 6;
        const COSMICS_COUNT = 2;
        const TECHNICAL_COUNT = 1;
        const SYNTHETIC_COUNT = 2;
        const CALIBRATION_COUNT = 1;

        getAllRunsDto.query = { filter: { definitions: [RunDefinition.PHYSICS] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(PHYSICS_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.PHYSICS)).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: [RunDefinition.COSMICS] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(COSMICS_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.COSMICS)).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: [RunDefinition.SYNTHETIC] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(SYNTHETIC_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.SYNTHETIC)).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: [RunDefinition.TECHNICAL] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(TECHNICAL_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.TECHNICAL)).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: [RunDefinition.CALIBRATION] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(CALIBRATION_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.CALIBRATION)).to.be.true;
        }

        getAllRunsDto.query = { filter: { definitions: [RunDefinition.PHYSICS, RunDefinition.COSMICS] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(PHYSICS_COUNT + COSMICS_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.PHYSICS || definition === RunDefinition.COSMICS)).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: [RunDefinition.TECHNICAL, RunDefinition.SYNTHETIC] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(TECHNICAL_COUNT + SYNTHETIC_COUNT);
            expect(runs.every(({ definition }) => definition === RunDefinition.TECHNICAL || definition === RunDefinition.SYNTHETIC)).to.be.true;
        }
        getAllRunsDto.query = { filter: { definitions: [RunDefinition.COMMISSIONING] } };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs.every(({ definition }) => definition === RunDefinition.COMMISSIONING)).to.be.true;
        }
        getAllRunsDto.query = {
            filter: {
                definitions: [
                    RunDefinition.PHYSICS,
                    RunDefinition.SYNTHETIC,
                    RunDefinition.COSMICS,
                    RunDefinition.TECHNICAL,
                    RunDefinition.CALIBRATION,
                ],
            },
        };
        {
            const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
            expect(runs).to.have.lengthOf(PHYSICS_COUNT + COSMICS_COUNT + SYNTHETIC_COUNT + TECHNICAL_COUNT + CALIBRATION_COUNT);
            const any = [
                RunDefinition.PHYSICS,
                RunDefinition.COSMICS,
                RunDefinition.SYNTHETIC,
                RunDefinition.TECHNICAL,
                RunDefinition.CALIBRATION,
            ];
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
        expect(runs).to.have.lengthOf(6);
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
        expect(runs).to.have.lengthOf(8);
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
        expect(runs[0].runNumber).to.equal(98);
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

    it('should successfully filter on "updatedAt"', async () => {
        {
            getAllRunsDto.query = {
                filter: {
                    updatedAt: {
                        from: new Date('2019-08-08 13:00:00').getTime(),
                        to: new Date('2019-08-08 13:00:00').getTime(),
                    },
                },
            };
            const { runs } = await new GetAllRunsUseCase()
                .execute(getAllRunsDto);
            expect(runs).to.be.an('array');
            expect(runs).to.have.lengthOf(97);
        }
        {
            getAllRunsDto.query = {
                filter: {
                    updatedAt: {
                        from: new Date('2019-08-09 14:00:00').getTime(),
                        to: new Date('2022-03-22 15:00:00').getTime(),
                    },
                },
            };
            const { runs } = await new GetAllRunsUseCase()
                .execute(getAllRunsDto);
            expect(runs).to.be.an('array');
            expect(runs).to.have.lengthOf(1);
        }
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

        // One test run is about 25h, 7 other are more than 25 hours
        const pivot = 25 * 60 * 60 * 1000;
        runDuration.operator = '=';
        runDuration.limit = pivot;
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(3);
        expect(runs.every((run) => run.runDuration === pivot)).to.be.true;

        runDuration.operator = '>=';
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');

        expect(runs).to.have.lengthOf(7);
        expect(runs.every((run) => run.runDuration >= pivot)).to.be.true;

        runDuration.operator = '>';
        ({ runs } = await getAllRunsUseCase.execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(4);
        expect(runs.every((run) => run.runDuration > pivot)).to.be.true;
    });

    it('should successfully filter on detectors', async () => {
        getAllRunsDto.query = { filter: { detectors: { operator: 'and', values: 'ITS' } } };

        let { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(8);

        getAllRunsDto.query.filter.detectors.values = 'ITS   ,   FT0';

        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(4);

        getAllRunsDto.query.filter.detectors.values = 'ITS,FT0';

        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(4);

        getAllRunsDto.query.filter.detectors.values = 'FT0,ITS';

        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(4);

        getAllRunsDto.query.filter.detectors.operator = 'or';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(8);

        getAllRunsDto.query.filter.detectors.operator = 'none';
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
        expect(runs).to.have.lengthOf(48);
        expect(runs.every((run) => run.nDetectors >= 6)).to.be.true;

        nDetectors.operator = '>';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        // 3 runs have 15 detectors
        expect(runs).to.have.lengthOf(3);
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

    it('should successfully filter on ctf file count number', async () => {
        const ctfFileCount = {
            operator: '<',
            limit: 200,
        };
        getAllRunsDto.query = { filter: { ctfFileCount } };

        let { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);

        ctfFileCount.operator = '<=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(2);
        expect(runs.every((run) => run.ctfFileCount <= 200)).to.be.true;

        ctfFileCount.operator = '=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);
        expect(runs.every((run) => run.ctfFileCount === 200)).to.be.true;

        ctfFileCount.operator = '>=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(7);
        expect(runs.every((run) => run.ctfFileCount >= 200)).to.be.true;

        ctfFileCount.operator = '>';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(6);
        expect(runs.every((run) => run.ctfFileCount >= 500)).to.be.true;
    });

    it('should successfully filter on tf file count number', async () => {
        const tfFileCount = {
            operator: '<',
            limit: 30,
        };
        getAllRunsDto.query = { filter: { tfFileCount } };

        let { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(0);

        tfFileCount.operator = '<=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(7);
        expect(runs.every((run) => run.tfFileCount <= 30)).to.be.true;

        tfFileCount.operator = '=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(7);
        expect(runs.every((run) => run.tfFileCount === 30)).to.be.true;

        tfFileCount.operator = '>=';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(8);
        expect(runs.every((run) => run.tfFileCount >= 30)).to.be.true;

        tfFileCount.operator = '>';
        ({ runs } = await new GetAllRunsUseCase().execute(getAllRunsDto));
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(1);
        expect(runs.every((run) => run.tfFileCount > 30)).to.be.true;
    });

    it('should successfully return an array, only containing runs found from passed list', async () => {
        getAllRunsDto.query = {
            filter: {
                environmentIds: '-1,Dxi029djX, , TDI59So3d,10',
            },
        };
        const { runs } = await new GetAllRunsUseCase().execute(getAllRunsDto);
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(6);
        expect(runs.every((run) => ['Dxi029djX', 'TDI59So3d'].includes(run.environmentId))).to.be.true;
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
        const requiredQualities = [RunQualities.BAD, RunQualities.TEST];
        getAllRunsDto.query = { filter: { runQualities: requiredQualities }, page: { limit: 100 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(43);
        expect(runs.every((run) => requiredQualities.includes(run.runQuality))).to.be.true;
    });

    it('should successfully return an array containing only runs with specified trigger values', async () => {
        const requiredTriggers = ['OFF', 'CTP'];
        getAllRunsDto.query = { filter: { triggerValues: requiredTriggers }, page: { limit: 100 } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf(21);
    });
    it('should successfully return an array, only containing runs found with lhc periods filter', async () => {
        getAllRunsDto.query = {
            filter: {
                lhcPeriods: 'LHC22b, LHC22a',
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

    it('should successfully filter by aliceL3Current', async () => {
        const { runs } = await new GetAllRunsUseCase().execute({
            query: {
                filter: {
                    magnets: {
                        l3: 30003,
                    },
                },
            },
        });
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf.greaterThan(0);
        expect(runs.every(({ aliceL3Current, aliceL3Polarity }) =>
            Math.round(aliceL3Current * (aliceL3Polarity === 'NEGATIVE' ? -1 : 1) / 1000) === 30003)).to.be.true;
    });

    it('should successfully filter by aliceDipoleCurrent', async () => {
        const { runs } = await new GetAllRunsUseCase().execute({
            query: {
                filter: {
                    magnets: {
                        dipole: 0,
                    },
                },
            },
        });
        expect(runs).to.be.an('array');
        expect(runs).to.have.lengthOf.greaterThan(0);
        expect(runs.every(({ aliceDipoleCurrent, aliceDipolePolarity }) =>
            Math.round(aliceDipoleCurrent * (aliceDipolePolarity === 'NEGATIVE' ? -1 : 1) / 1000) === 0)).to.be.true;
    });

    const inelasticInteractionRateFilteringTestsParameters = {
        muInelasticInteractionRate: { operator: '>=', value: 0.05, expectedRuns: [49] },
        inelasticInteractionRateAvg: { operator: '>=', value: 500000, expectedRuns: [106, 49, 2] },
        inelasticInteractionRateAtStart: { operator: '<=', value: 10000, expectedRuns: [54] },
        inelasticInteractionRateAtMid: { operator: '<', value: 30000, expectedRuns: [54] },
        inelasticInteractionRateAtEnd: { operator: '=', value: 50000, expectedRuns: [56] },
    };

    for (const [property, testParameters] of Object.entries(inelasticInteractionRateFilteringTestsParameters)) {
        const { operator, value, expectedRuns } = testParameters;
        it(`should successfully filter by ${property}`, async () => {
            const { runs } = await new GetAllRunsUseCase().execute({
                query: {
                    filter: {
                        [property]: {
                            operator,
                            limit: value,
                        },
                    },
                },
            });
            expect(runs).to.be.an('array');
            expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRuns);
        });
    }

    it('should successfully filter by GAQ notBadFraction', async () => {
        const dataPassIds = [1];
        {
            const { runs } = await new GetAllRunsUseCase().execute({
                query: {
                    filter: {
                        dataPassIds,
                        gaq: { notBadFraction: { operator: '<', limit: 0.8 } },
                    },
                },
            });
            expect(runs).to.be.an('array');
            expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members([107]);
        }
        {
            const { runs } = await new GetAllRunsUseCase().execute({
                query: {
                    filter: {
                        dataPassIds,
                        gaq: { notBadFraction: { operator: '<', limit: 0.8 }, mcReproducibleAsNotBad: true },
                    },
                },
            });
            expect(runs).to.have.lengthOf(0);
        }
    });
};
