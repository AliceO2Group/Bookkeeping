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

const { tag: { GetTagByNameUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { GetTagByNameDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getLogDto;

    beforeEach(async () => {
        getLogDto = await GetTagByNameDto.validateAsync({
            query: {
                name: 'FOOD',
            },
        });
    });

    it('should return an object that has a valid email and mattermost fields', async () => {
        const result = await new GetTagByNameUseCase()
            .execute(getLogDto);

        expect(result.mattermost).to.equal('food');
        expect(result.email).to.equal('food-group@cern.ch');
    });
    it('should return null when invalid data is given', async () => {
        getLogDto = await GetTagByNameDto.validateAsync({
            query: {
                name: '9999999999',
            },
        });
        const result = await new GetTagByNameUseCase()
            .execute(getLogDto);

        expect(result).to.be.null;
    });
    it('should return an object when the value is URI encoded', async () => {
        getLogDto = await GetTagByNameDto.validateAsync({
            query: {
                name: 'DCS',
            },
        });
        const result = await new GetTagByNameUseCase()
            .execute(getLogDto);

        expect(result.mattermost).to.equal('cake');
        expect(result.email).to.equal('cake@cern.ch');
    });
};
