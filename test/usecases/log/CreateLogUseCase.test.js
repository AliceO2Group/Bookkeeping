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

const { repositories: { LogRepository } } = require('../../../lib/database');
const { log: { CreateLogUseCase } } = require('../../../lib/usecases');
const { dtos: { CreateLogDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createLogDto;

    beforeEach(async () => {
        createLogDto = await CreateLogDto.validateAsync({
            body: {
                title: 'Yet another log',
                text: 'This is the text field of yet another log.',
                tags: [],
            },
        });
        createLogDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });

    it('should insert a new Log', async () => {
        const nLogsBefore = await LogRepository.count();

        await new CreateLogUseCase()
            .execute(createLogDto);

        const nLogsAfter = await LogRepository.count();
        expect(nLogsAfter).to.be.greaterThan(nLogsBefore);
    });

    it('should insert a new Log with the same title as provided', async () => {
        const expectedTitle = `Log #${Math.round(Math.random() * 1000)}`;

        createLogDto.body.title = expectedTitle;
        const { result } = await new CreateLogUseCase()
            .execute(createLogDto);

        expect(result.title).to.equal(expectedTitle);
    });

    it('should insert a new Log with the text title as provided', async () => {
        const expectedText = `Random content: ${Math.round(Math.random() * 1000)}`;

        createLogDto.body.text = expectedText;
        const { result } = await new CreateLogUseCase()
            .execute(createLogDto);

        expect(result.text).to.equal(expectedText);
    });

    it('should insert a new Log with the tags as provided', async () => {
        const expectedTagTexts = ['FOOD', 'MAINTENANCE'];

        createLogDto.body.tags = expectedTagTexts;
        const { result } = await new CreateLogUseCase()
            .execute(createLogDto);

        expect(result.tags.map(({ text }) => text)).to.deep.equal(expectedTagTexts);
    });

    it('should create a new Log with empty title but a parent log', async () => {
        const expectedTitle = '';
        const expectedParentLogId = 3;

        createLogDto.body.title = expectedTitle;
        createLogDto.body.parentLogId = expectedParentLogId;

        createLogDto.session = {
            personid: 2,
            id: 2,
            name: 'Jan Janssen',
        };

        const { result } = await new CreateLogUseCase()
            .execute(createLogDto);
        expect(result.title).to.equal(expectedTitle);
        expect(result.parentLogId).to.equal(expectedParentLogId);
    });
    it('should create a new Log with no duplicate run numbers', async () =>{
        const expectedResult = [
            { id: 1, runNumber: 1 },
            { id: 2, runNumber: 2 },
            { id: 3, runNumber: 3 },
        ];
        createLogDto.body.runNumbers = '1,2,2,3,3,1,2,1,2,3';

        createLogDto.session = {
            personid: 2,
            id: 2,
            name: 'Jan Janssen',
        };

        const { result } = await new CreateLogUseCase()
            .execute(createLogDto);
        expect(result.runs).to.deep.equal(expectedResult);
    });
};
