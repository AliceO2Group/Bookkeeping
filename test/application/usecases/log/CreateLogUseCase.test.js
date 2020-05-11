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

const { repositories: { LogRepository } } = require('../../../../lib/database');
const { log: { CreateLogUseCase } } = require('../../../../lib/usecases');
const { dtos: { CreateLogDto } } = require('../../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createLogDto;

    beforeEach(() => {
        createLogDto = new CreateLogDto({
            body: {
                title: 'Yet another log',
            },
        });
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
        const result = await new CreateLogUseCase()
            .execute(createLogDto);

        expect(result.title).to.equal(expectedTitle);
    });
};
