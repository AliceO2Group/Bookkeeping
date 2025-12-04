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

    // Beam duration filter tests
    
    it('should only contain specified stable beam durations, < 12:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: '43200', beamDurationOperator: '<'  } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto);
        expect(lhcFills).to.be.an('array').and.lengthOf(3)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).lessThan(43200)
        });
    });

     it('should only contain specified stable beam durations, <= 12:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: '43200', beamDurationOperator: '<=' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)
        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).lessThanOrEqual(43200)
        });
    })

    it('should only contain specified stable beam durations, = 00:01:40', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: '100', beamDurationOperator: '=' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)
        expect(lhcFills).to.be.an('array').and.lengthOf(3)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).equal(100)
        });
    });

     it('should only contain specified stable beam durations, >= 00:01:40', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: '100', beamDurationOperator: '>='  } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)
        
        expect(lhcFills).to.be.an('array').and.lengthOf(4)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).greaterThanOrEqual(100)
        });
     })

     it('should only contain specified stable beam durations, > 00:01:40', async () => {
        getAllLhcFillsDto.query = { filter: { beamDuration: '100', beamDurationOperator: '>' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).greaterThan(100)
        });
     })

     it('should only contain specified stable beam durations, = 00:00:00', async () => {
        // Tests the usecase's ability to replace the request for 0 to a request for null.
        getAllLhcFillsDto.query = { filter: { hasStableBeams: true, beamDuration: 0, beamDurationOperator: '=' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.stableBeamsDuration).equals(null)
        });
     })

    it('should only contain specified total run duration, > 04:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: '14400', runDurationOperator: '>' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.runDuration).greaterThan(14400)
        });
    })

    it('should only contain specified total run duration, >= 05:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: '18000', runDurationOperator: '>=' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.runDuration).greaterThan(18000)
        });
    })

    it('should only contain specified total run duration, = 05:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: '18000', runDurationOperator: '=' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.runDuration).greaterThan(18000)
        });
    })


    it('should only contain specified total run duration, <= 05:00:00', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: '18000', runDurationOperator: '<=' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.runDuration).greaterThan(18000)
        });
    })

    it('should only contain specified total run duration, < 06:30:59', async () => {
        getAllLhcFillsDto.query = { filter: { runDuration: '23459', runDurationOperator: '<' } };
        const { lhcFills } = await new GetAllLhcFillsUseCase().execute(getAllLhcFillsDto)

        expect(lhcFills).to.be.an('array').and.lengthOf(1)
        lhcFills.forEach((lhcFill) => {
            expect(lhcFill.runDuration).greaterThan(23459)
        });
    })
};
