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

const { tag: { GetAllTagsUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { GetAllTagsDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllTagsDto;

    beforeEach(async () => {
        getAllTagsDto = await GetAllTagsDto.validateAsync({});
    });
    it('should successfully return an array with tags', async () => {
        const { tags } = await new GetAllTagsUseCase().execute();

        expect(tags).to.be.an('array');
    });
    it('should return tags sorted by text', async () => {
        const { tags } = await new GetAllTagsUseCase().execute();

        const sorted = Array.from(tags);
        sorted.sort((a, b) => {
            if (a.archived === b.archived) {
                return a.text.localeCompare(b.text);
            } else {
                return a.archived - b.archived;
            }
        });

        expect(tags).to.eql(sorted);
    });
    it('should successfully return an array with tags with specified ids', async () => {
        getAllTagsDto.query = { filter: { ids: '1,2' } };
        const { tags } = await new GetAllTagsUseCase().execute(getAllTagsDto);

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(2);
        expect(tags[0].id).to.equal(1);
        expect(tags[0].text).to.equal('FOOD');
        expect(tags[1].id).to.equal(2);
        expect(tags[1].text).to.equal('RUN');
    });
    it('should successfully return 204 status if no tag was found with specified ids', async () => {
        getAllTagsDto.query = { filter: { ids: '5002' } };
        const { tags } = await new GetAllTagsUseCase().execute(getAllTagsDto);

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(0);
    });
    it('should successfully return an array with tags with specified texts', async () => {
        getAllTagsDto.query = { filter: { texts: 'FOOD,SL' } };
        const { tags } = await new GetAllTagsUseCase().execute(getAllTagsDto);

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(2);
        expect(tags[0].id).to.equal(1);
        expect(tags[0].text).to.equal('FOOD');
        expect(tags[1].id).to.equal(8);
        expect(tags[1].text).to.equal('SL');
    });
    it('should successfully return an array with tags containing given text search', async () => {
        getAllTagsDto.query = { filter: { partialText: 'MAI' } };
        let { tags } = await new GetAllTagsUseCase().execute(getAllTagsDto);

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(1);
        expect(tags[0].id).to.equal(3);
        expect(tags[0].text).to.equal('MAINTENANCE');

        getAllTagsDto.query = { filter: { partialText: 'ANCE' } };

        ({ tags } = await new GetAllTagsUseCase().execute(getAllTagsDto));

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(1);
        expect(tags[0].id).to.equal(3);
        expect(tags[0].text).to.equal('MAINTENANCE');

        getAllTagsDto.query = { filter: { partialText: '-TAG-' } };

        ({ tags } = await new GetAllTagsUseCase().execute(getAllTagsDto));

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(34);
        expect(tags.every((tag) => tag.text.includes('-TAG-'))).to.be.true;

        getAllTagsDto.query = { filter: { partialText: 'DO-NOT-EXISTS' } };

        ({ tags } = await new GetAllTagsUseCase().execute(getAllTagsDto));

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(0);
    });
    it('should successfully return an array with tags with specified emails', async () => {
        getAllTagsDto.query = { filter: { emails: 'other-group@cern.ch' } };
        const { tags } = await new GetAllTagsUseCase().execute(getAllTagsDto);

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(1);
        expect(tags[0].id).to.equal(8);
        expect(tags[0].text).to.equal('SL');
    });
    it('should successfully return an array with tags with specified mattermosts', async () => {
        getAllTagsDto.query = { filter: { mattermosts: 'marathon,,food' } };
        const { tags } = await new GetAllTagsUseCase().execute(getAllTagsDto);

        expect(tags).to.be.an('array');
        expect(tags).to.have.lengthOf(2);
        expect(tags[0].id).to.equal(1);
        expect(tags[0].text).to.equal('FOOD');
        expect(tags[1].id).to.equal(2);
        expect(tags[1].text).to.equal('RUN');
    });
};
