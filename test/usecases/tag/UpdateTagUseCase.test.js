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

const { tag: { UpdateTagUseCase } } = require('../../../lib/usecases');
const { dtos: { UpdateTagDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let updateTagDto;

    beforeEach(async () => {
        updateTagDto = await UpdateTagDto.validateAsync({
            body: {
                mattermost: 'tag,tag,tag',
                email: null,
            },
            params: {
                tagId: 3,
            },
        });
        updateTagDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    it('should save the correct values', async () => {
        const expectedTag = updateTagDto.mattermost;
        const { result } = await new UpdateTagUseCase()
            .execute(updateTagDto);
        expect(result.mattermost).to.equal(expectedTag);
        expect(result.lastEditedName).to.equal(updateTagDto.session.name);
    });
};
