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
const { log: { CreateLogUseCase } } = require('../../../../lib/application/usecases');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should insert a new Log', async () => {
        const nLogsBefore = await LogRepository.count();

        await new CreateLogUseCase()
            .setLogRepository(LogRepository)
            .execute({ title: 'Yet another log' });

        const nLogsAfter = await LogRepository.count();
        expect(nLogsAfter).to.be.greaterThan(nLogsBefore);
    });

    it('should insert a new Log with the same title as provided', async () => {
        const expectedTitle = `Log #${Math.round(Math.random() * 1000)}`;

        const result = await new CreateLogUseCase()
            .setLogRepository(LogRepository)
            .execute({ title: expectedTitle });

        expect(result.title).to.equal(expectedTitle);
    });
};
