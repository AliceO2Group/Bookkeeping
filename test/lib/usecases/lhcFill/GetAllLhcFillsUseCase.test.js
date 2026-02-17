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

const { environment: { GetAllEnvironmentsUseCase } } = require('../../../../lib/usecases/index.js');
const { lhcFill: { GetAllLhcFillsUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { GetAllLhcFillsDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllLhcFillsDto;

    beforeEach(async () => {
        getAllLhcFillsDto = await GetAllLhcFillsDto.validateAsync({});
    });
    it('should return all the lhcFills', async () => {
        const result = await new GetAllEnvironmentsUseCase()
            .execute(getAllLhcFillsDto);
        expect(result.environments).to.be.an('array');
    });

    it('should only containing lhc fills with stable beams', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

        expect(lhcFills).to.be.an('array');
        lhcFills.forEach((lhcFill) => {
            // Every lhcFill should have stableBeamsStart
            expect(lhcFill.stableBeamsStart).to.not.be.null;
        });
    });

    // Fill number filter tests

    it('should only contain specified fill number', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, fillNumbers: '6' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);
        expect(lhcFills).to.be.an('array').and.lengthOf(1)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillNumber).to.equal(6)
        });
    })

    it('should only contain specified fill numbers', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, fillNumbers: '6,3' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

    
        expect(lhcFills).to.be.an('array').and.lengthOf(2)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillNumber).oneOf([6,3])
        });
    })

    it('should only contain specified fill numbers, range', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, fillNumbers: '1-3,6' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

    
        expect(lhcFills).to.be.an('array').and.lengthOf(4)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillNumber).oneOf([1,2,3,6])
        });
    })

    it('should only contain specified fill numbers, whitespace', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, fillNumbers: ' 6 , 3 ' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

    
        expect(lhcFills).to.be.an('array').and.lengthOf(2)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillNumber).oneOf([6,3])
        });
    })

    it('should only contain specified fill numbers, comma misplacement', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, fillNumbers: ',6,3,' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

    
        expect(lhcFills).to.be.an('array').and.lengthOf(2)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillNumber).oneOf([6,3])
        });
    })

    it('should only contain matching scheme name, one precise', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, schemeName: 'schemename' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

        expect(lhcFills).to.be.an('array').and.lengthOf(3)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillingSchemeName).to.equal('schemename')
        });
    })

    it('should only contain matching scheme name, one partial', async () => {
        getAllLhcFillsDto.query = { filter: { schemeName: '25ns_2352b_2340_2004_2133' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

        expect(lhcFills).to.be.an('array').and.lengthOf(1)

        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.fillingSchemeName).to.equal('25ns_2352b_2340_2004_2133_108bpi_24inj')
        });
    })

    // Beam duration filter tests
    it('should only contain specified stable beam durations, < 12:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: {limit: '43200', operator: '<'} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);
        expect(lhcFills).to.be.an('array').and.lengthOf(3)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).lessThan(43200)
        });
    });

    it('should only contain specified stable beam durations, <= 12:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: {limit: '43200', operator: '<='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)
        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).lessThanOrEqual(43200)
        });
    })

    it('should only contain specified stable beam durations, = 00:01:40', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: {limit: '100', operator: '='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)
        expect(lhcFills).to.be.an('array').and.lengthOf(3)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).equal(100)
        });
    });

    it('should only contain specified stable beam durations, >= 00:01:40', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: {limit: '100', operator: '>='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)
        
        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).greaterThanOrEqual(100)
        });
    })

    it('should only contain specified stable beam durations, > 00:01:40', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: {limit: '100', operator: '>'} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).greaterThan(100)
        });
    })

    it('should only contain specified stable beam durations, = 00:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, beamDuration: {limit: '0', operator: '='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(0)
    })

    it('should only contain specified total run duration, < 00:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '0', operator: '<'} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(0)
    });

    it('should only contain specified total run duration, > 00:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '0', operator: '>'} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThan(0)
        });
    });

    it('should only contain specified total run duration, <= 00:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '0', operator: '<='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).equals(0)
        });
    });

    it('should only contain specified total run duration, >= 00:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '0', operator: '>='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(5)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThanOrEqual(0)
        });
    });


    it('should only contain specified total run duration, > 04:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '14400', operator: '>'} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThan(14400)
        });
    })

    it('should only contain specified total run duration, >= 05:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '18000', operator: '>='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThan(18000)
        });
    })

    it('should only contain specified total run duration, = 05:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '18000', operator: '='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThan(18000)
        });
    })

    it('should only contain specified total run duration, = 00:00:00', async () => {
        // Tests the usecase's ability to replace the request for 0 to a request for null.
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '0', operator: '='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).equals(0)
        });
    })

    it('should only contain specified total run duration, <= 05:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '18000', operator: '<='} } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThan(18000)
        });
    })

    it('should only contain specified total run duration, < 06:30:59', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: {limit: '23459', operator: '<'} } }; 
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.statistics.runsCoverage).greaterThan(23459)
        });
    })

    it('should only contain specified beam type, {p-p}', async () => {
        getAllLhcFillsDto.query = { filter: { beamTypes: 'p-p' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(2)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.beamType).to.equal('p-p')
        });
    })

    it('should only contain specified beam types, {p-p, PROTON-PROTON, Pb-Pb}', async () => {
        const beamTypes = ['p-p', 'PROTON-PROTON', 'Pb-Pb']
        
        getAllLhcFillsDto.query = { filter: { beamTypes: beamTypes.join(',') } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.beamType).oneOf(beamTypes)
        });
    })

    it('should ignore unknown beam types, {p-p, Hello-world, Pb-Pb}', async () => {
        const beamTypes = ['p-p', 'Hello-world', 'Pb-Pb']
        
        getAllLhcFillsDto.query = { filter: { beamTypes: beamTypes.join(',') } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(3)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.beamType).oneOf(['p-p', 'Pb-Pb'])
        });
    })

    it('should be empty with unknown beam type, {Hello-world}', async () => {
        getAllLhcFillsDto.query = { filter: { beamTypes: 'Hello-world' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(0)
    })

    it('should return an array with only \'from\' values given', async () => {
        getAllLhcFillsDto.query = {
            filter: {
                stableBeamsStart: {
                    from: 1647867600000,
                },
                stableBeamsEnd: {
                    from: 1647867600000,
                },
            },
        };

        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

        expect(lhcFills).to.be.an('array');
        expect(lhcFills).to.have.lengthOf(3);
    });

    it('should return an array with only \'to\' values given', async () => {
        getAllLhcFillsDto.query = {
            filter: {
                stableBeamsStart: { 
                    to: 2000000000000 
                },
                stableBeamsEnd: { 
                    to: 2000000000000 
                },
            },
        };

        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

        expect(lhcFills).to.be.an('array');
        expect(lhcFills).to.have.lengthOf(4);
    });

    it('should return an array with fills on certain timestamps', async () => {
        getAllLhcFillsDto.query = {
            filter: {
                stableBeamsStart: {
                    from: 1647867600000,
                    to: 1647867600000,
                },
                stableBeamsEnd: {
                    from: 1647961200000,
                    to: 1647961200000,
                },
            },
        };

        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);

        expect(lhcFills).to.be.an('array');
        expect(lhcFills).to.have.lengthOf(3);
    });
};
