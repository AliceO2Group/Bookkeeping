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

const { run: { GetRunUseCase } } = require('../../../lib/usecases');
const { dtos: { GetRunDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getRunDto;

    beforeEach(async () => {
        getRunDto = await GetRunDto.validateAsync({
            params: {
                runId: 1,
            },
        });
    });

    it('should return an object that has the `id` property', async () => {
        const result = await new GetRunUseCase()
            .execute(getRunDto);

        expect(result).to.have.ownProperty('id');
        expect(result.id).to.equal(1);
    });
};
