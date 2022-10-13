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

const { environment: { UpdateEnvironmentUseCase } } = require('../../../lib/usecases');
const { dtos: { UpdateEnvironmentDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const wrongId = '9999999999';

    let updateEnvironmentDto;

    beforeEach(async () => {
        updateEnvironmentDto = await UpdateEnvironmentDto.validateAsync({
            params: {
                envId: 'EIDO13i3D',
            },
            body: {
                toredownAt: new Date(),
                status: 'STOPPED',
                statusMessage: 'Completely new message',
            },
        });

        updateEnvironmentDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });

    it('Should be able to update the environment with correct values', async () => {
        const { result } = await new UpdateEnvironmentUseCase()
            .execute(updateEnvironmentDto);
        expect(result.status).to.equal('STOPPED');
    });

    it('Should give an error when the id of the environment can not be found', async () => {
        updateEnvironmentDto.params.envId = wrongId;
        const { error } = await new UpdateEnvironmentUseCase()
            .execute(updateEnvironmentDto);
        expect(error.status).to.equal('400');
        expect(error.title).to.equal(`Environment with this id (${wrongId}) could not be found`);
    });
};
