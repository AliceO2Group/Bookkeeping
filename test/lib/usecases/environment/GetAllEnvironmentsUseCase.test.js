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
const { dtos: { GetAllEnvironmentsDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllEnvsDto;

    beforeEach(async () => {
        getAllEnvsDto = await GetAllEnvironmentsDto.validateAsync({});
    });
    it('should return all the environments', async () => {
        const result = await new GetAllEnvironmentsUseCase()
            .execute(getAllEnvsDto);
        expect(result.environments).to.be.an('array');
    });

    it('should successfully filter environments on one id', async () => {
        getAllEnvsDto.query = { filter: { ids: 'SomeId' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(1);
        expect(environments[0].id).to.be.equal('SomeId');
    });

    it('should successfully filter environments on a list of ids', async () => {
        getAllEnvsDto.query = { filter: { ids: 'SomeId, newId, CmCvjNbg' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(3);
        expect(environments[0].id).to.be.equal('SomeId');
        expect(environments[1].id).to.be.equal('newId');
        expect(environments[2].id).to.be.equal('CmCvjNbg');
    });

    it('should successfully filter environments on a list of ids with a non existing id', async () => {
        getAllEnvsDto.query = { filter: { ids: 'SomeId, nonExistingIdEnv, newId' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments[0].id).to.be.equal('SomeId');
        expect(environments[1].id).to.be.equal('newId');
    });

    it('should successfully filter environments on one current status', async () => {
        getAllEnvsDto.query = { filter: { currentStatus: 'RUNNING' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments[0].id).to.be.equal('CmCvjNbg');
        expect(environments[1].id).to.be.equal('Dxi029djX');
    });

    it('should successfully filter environments on multiple current statusses', async () => {
        getAllEnvsDto.query = { filter: { currentStatus: 'RUNNING, ERROR' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(6);
        expect(environments[0].id).to.be.equal('SomeId');
        expect(environments[1].id).to.be.equal('newId');
        expect(environments[2].id).to.be.equal('CmCvjNbg');
        expect(environments[3].id).to.be.equal('EIDO13i3D');
        expect(environments[4].id).to.be.equal('8E4aZTjY');
        expect(environments[5].id).to.be.equal('Dxi029djX');
    });

    it('should successfully filter environments current status with limit', async () => {
        const limit = 2;
        getAllEnvsDto.query = { page: { limit: limit }, filter: { currentStatus: 'RUNNING, ERROR' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(limit);
    });
};
