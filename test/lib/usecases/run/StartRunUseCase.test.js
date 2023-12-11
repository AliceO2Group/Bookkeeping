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

const { run: { StartRunUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { StartRunDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');
const { environmentService } = require('../../../../lib/server/services/environment/EnvironmentService.js');
const { RunQualities } = require('../../../../lib/domain/enums/RunQualities.js');

const { expect } = chai;

module.exports = () => {
    let startRunDto;

    beforeEach(async () => {
        startRunDto = await StartRunDto.validateAsync({
            body: {
                runNumber: 109,
                timeO2Start: '2022-03-21 13:00:00',
                timeTrgStart: '2022-03-21 13:00:00',
                environmentId: '1234567890',
                runType: 'NONE',
                nDetectors: 3,
                bytesReadOut: 1024,
                nSubtimeframes: 10,
                nFlps: 10,
                nEpns: 10,
                dd_flp: true,
                dcs: true,
                epn: true,
                epnTopology: 'normal',
                detectors: 'CPV',
            },
        });
    });
    it('should successfully store and return the saved entity', async () => {
        const { result, error } = await new StartRunUseCase().execute(startRunDto);
        expect(error).to.be.undefined;
        expect(result).to.be.an('object');
        expect(result.id).to.equal(109);
    });

    it('should fail to save a run with an already existing run number', async () => {
        const { result, error } = await new StartRunUseCase()
            .execute(startRunDto);

        expect(result).to.be.undefined;
        expect(error).to.eql({
            status: 409,
            title: 'Conflict',
            detail: 'A run already exists with run number 109',
        });
    });

    it('should successfully store and return the saved run with default values if not provided', async () => {
        delete startRunDto.body.detectors;
        startRunDto.body.runNumber = 110;
        const { result, error } = await new StartRunUseCase().execute(startRunDto);
        expect(error).to.be.undefined;
        expect(result).to.be.an('object');
        expect(result.runType.name).to.equal('NONE');
        expect(result.id).to.equal(110);
        expect(result.detectors).to.equal('');
        expect(result.runQuality).to.equal(RunQualities.NONE);
    });

    it('should successfully create a run with a non-existing run type', async () => {
        startRunDto.body.runNumber = 111;
        startRunDto.body.runType = 'NEW_FAKE_RUN_TYPE';
        const { result, error } = await new StartRunUseCase()
            .execute(startRunDto);
        expect(error).to.be.undefined;

        expect(result).to.be.an('object');
        expect(result.runType.name).to.equal('NEW_FAKE_RUN_TYPE');
    });

    it('should successfully link the run to the given environment', async () => {
        const environmentId = 'Dxi029djX';
        const runNumber = 112;
        startRunDto.body.runNumber = runNumber;
        startRunDto.body.environmentId = environmentId;
        const { error } = await new StartRunUseCase().execute(startRunDto);
        expect(error).to.be.undefined;

        const environment = await environmentService.get(environmentId);
        expect(environment.runs.map(({ runNumber }) => runNumber).includes(runNumber)).to.be.true;
    });
};
