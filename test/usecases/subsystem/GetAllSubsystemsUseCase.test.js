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

const { repositories: { SubsystemRepository } } = require('../../../lib/database');
const { dtos: { GetAllSubsystemsDto } } = require('../../../lib/domain');
const { subsystem: { GetAllSubsystemsUseCase } } = require('../../../lib/usecases');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllSubsystemsDto;

    beforeEach(async () => {
        getAllSubsystemsDto = await GetAllSubsystemsDto.validateAsync({});
    });

    it('should return an array', async () => {
        const { subsystems } = await new GetAllSubsystemsUseCase()
            .execute();

        expect(subsystems).to.be.an('array');
    });

    it('should return a count that is the same as the count method of the repository', async () => {
        const expectedCount = await SubsystemRepository.count();

        const { count } = await new GetAllSubsystemsUseCase()
            .execute(getAllSubsystemsDto);

        expect(count).to.equal(expectedCount);
    });
};
