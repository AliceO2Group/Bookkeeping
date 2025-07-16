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
        expect(environments.map(({ id }) => id)).to.have.members(['SomeId', 'newId', 'CmCvjNbg']);
    });

    it('should successfully filter environments on a list of ids with a non existing id', async () => {
        getAllEnvsDto.query = { filter: { ids: 'SomeId, nonExistingIdEnv, newId' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments.map(({ id }) => id)).to.have.members(['SomeId', 'newId']);
    });

    it('should successfully filter environments on one current status', async () => {
        getAllEnvsDto.query = { filter: { currentStatus: 'RUNNING' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments.map(({ id }) => id)).to.have.members(['CmCvjNbg', 'Dxi029djX']);
    });

    it('should successfully filter environments on multiple current statuses', async () => {
        getAllEnvsDto.query = { filter: { currentStatus: 'RUNNING, ERROR' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(6);
        expect(environments.map(({ id }) => id)).to.have.members(['SomeId', 'newId', 'CmCvjNbg', 'EIDO13i3D', '8E4aZTjY', 'Dxi029djX']);
    });

    it('should successfully filter environments on status history with - input', async () => {
        getAllEnvsDto.query = { filter: { statusHistory: 'S-E' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments.map(({ id }) => id)).to.have.members(['EIDO13i3D', '8E4aZTjY']);
    });

    it('should successfully filter environments on status history without - input', async () => {
        getAllEnvsDto.query = { filter: { statusHistory: 'SE' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments.map(({ id }) => id)).to.have.members(['EIDO13i3D', '8E4aZTjY']);
    });

    it('should successfully filter environments on status history with equal input with -', async () => {
        getAllEnvsDto.query = { filter: { statusHistory: 'S-E' } };
        const withChar = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);
        getAllEnvsDto.query = { filter: { statusHistory: 'SE' } };
        const withoutChar = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(withChar.environments).to.be.an('array');
        expect(withChar.environments.length).to.be.equal(2);
        expect(withoutChar.environments).to.be.an('array');
        expect(withoutChar.environments.length).to.be.equal(2);
        // Results need to be the same
        expect(withChar.environments[0].id).to.be.equal(withoutChar.environments[0].id);
        expect(withChar.environments[1].id).to.be.equal(withoutChar.environments[1].id);
    });

    it('should successfully filter environments status history with limit', async () => {
        const limit = 1;
        getAllEnvsDto.query = { page: { limit: limit }, filter: { statusHistory: 'SE' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(limit);
    });

    it('should successfully filter environments on one run number', async () => {
        getAllEnvsDto.query = { filter: { runNumbers: '103' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(1);
        expect(environments[0].id).to.be.equal('TDI59So3d');
    });

    it('should successfully filter environments on multiple run numbers', async () => {
        getAllEnvsDto.query = { filter: { runNumbers: '103, 96' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments.map(({ id }) => id)).to.have.members(['EIDO13i3D', 'TDI59So3d']);
    });

    it('should successfully filter environments run numbers with limit', async () => {
        const limit = 1;
        getAllEnvsDto.query = { page: { limit: limit }, filter: { runNumbers: '103, 96' } };

        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);
        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(limit);
    });

    it('should successfully filter environments current status with limit', async () => {
        const limit = 2;
        getAllEnvsDto.query = { page: { limit: limit }, filter: { currentStatus: 'RUNNING, ERROR' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(limit);
    });

    it('should successfully filter environments with substring query on one run number', async () => {
        getAllEnvsDto.query = { filter: { runNumbers: '10' } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);

        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        // Should include all environments with run numbers containing the substring 10
        expect(environments.map(({ id }) => id)).to.have.members(['TDI59So3d', 'Dxi029djX']);
    });

    it('should successfully filter environments on created from and to', async () => {
        const from = Date.now() - 24 * 60 * 60 * 1000; // environment from 24h ago which was created by CreateEnvironmentUseCase.test.js
        const to = Date.now() - 10;
        getAllEnvsDto.query = { filter: { created: { from, to } } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);
        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments[0].id).to.be.equal('newId');
        expect(environments[1].id).to.be.equal('SomeId');
    });

    it('should successfully filter environments on created from', async () => {
        const from = Date.now() - 24 * 60 * 60 * 1000; // environment from 24h ago which was created by CreateEnvironmentUseCase.test.js
        getAllEnvsDto.query = { filter: { created: { from } } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);
        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(2);
        expect(environments[0].id).to.be.equal('newId');
        expect(environments[1].id).to.be.equal('SomeId');
    });

    it('should successfully filter environments on created to', async () => {
        const to = Date.now() - 24 * 60 * 60 * 1000; // environment until 24h are created by seeders
        getAllEnvsDto.query = { filter: { created: { to } } };
        const { environments } = await new GetAllEnvironmentsUseCase().execute(getAllEnvsDto);
        expect(environments).to.be.an('array');
        expect(environments.length).to.be.equal(9); // Environments from seeders
    });
};
