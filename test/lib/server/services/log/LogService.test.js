/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const assert = require('assert');
const { logService } = require('../../../../../lib/server/services/log/LogService.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let logMock;

    beforeEach(async () => {
        logMock = {
            title: 'Yet another log',
            text: 'This is the text field of yet another log.',
            tags: [],
        };
    });

    it('Should throw when creating a log with a non-existing parent', async () => {
        await assert.rejects(
            () => logService.create({ ...logMock, parentLogId: 9999 }),
            new NotFoundError('Parent log with this id (9999) could not be found'),
        );
    });

    it('Should successfully return all the logs linked to a given LHC fill', async () => {
        const logsForFill = await logService.getAllByLhcFill(6);
        expect(logsForFill).to.lengthOf(2);
        expect(logsForFill.map(({ id }) => id)).to.eql([1, 119]);
    });

    it('Should successfully create a log linked to simulation passes', async () => {
        const log = await logService.create(logMock, [], [], [], [], [], [], ['LHC23k6c', 'LHC23k6a']);

        expect(log.simulationPasses.map(({ name }) => name)).to.have.members(['LHC23k6c', 'LHC23k6a']);
        expect(log.simulationPasses.every(({ id }) => typeof id === 'number')).to.be.true;
    });

    it('Should throw when creating a log linked to a non-existing simulation pass', async () => {
        await assert.rejects(
            () => logService.create(logMock, [], [], [], [], [], [], ['NOT_A_SIMULATION_PASS']),
            new NotFoundError('Simulation pass with this name (NOT_A_SIMULATION_PASS) could not be found'),
        );
    });

    it('Should successfully create a log linked to data passes', async () => {
        const log = await logService.create(logMock, [], [], [], [], [], ['LHC22b_apass1']);

        expect(log.dataPasses.map(({ name }) => name)).to.deep.equal(['LHC22b_apass1']);
    });

    it('Should throw when creating a log linked to a non-existing data pass', async () => {
        await assert.rejects(
            () => logService.create(logMock, [], [], [], [], [], ['NOT_A_DATA_PASS']),
            new NotFoundError('Data pass with this name (NOT_A_DATA_PASS) could not be found'),
        );
    });

    it('Should successfully return all the logs linked to a given environment', async () => {
        const logsForFill = await logService.getAllByEnvironment('8E4aZTjY');
        expect(logsForFill).to.lengthOf(3);
        expect(logsForFill.map(({ id }) => id)).to.eql([1, 3, 4]);
    });

    it('Should successfully return the correct amount of root logs only, based off the limit', async () => {
        const rootLogs = await logService.getAllRootLogs(10, 0);
        expect(rootLogs.logs).to.lengthOf(10);
        rootLogs.logs.forEach((log) => expect(log.parentLogId).to.equal(log.id));
    });

    it('Should successfully return an empty array with limit 0', async () => {
        const rootLogs = await logService.getAllRootLogs(0, 0);
        expect(rootLogs.logs).to.be.empty;
    });

    it('Should successfully return the correct logs based off the offset', async () => {
        const rootLogsFirstPage = await logService.getAllRootLogs(1, 0);
        const rootLogsSecondPage = await logService.getAllRootLogs(1, 1);

        expect(rootLogsFirstPage.logs[0].id).to.equal(1);
        expect(rootLogsSecondPage.logs[0].id).to.equal(5);
    });

    it('Should successfully return child logs of their parent log', async () => {
        const logWithChildrenId = 117;
        const expectedAmountOfChildren = 2;
        const childLogs = await logService.getChildLogsByParentId(logWithChildrenId);

        expect(childLogs.length).to.equal(expectedAmountOfChildren);
        childLogs.forEach((log) => expect(log.parentLogId === logWithChildrenId));
    });

    it('Should successfully return an empty array if parent has no children', async () => {
        const logWithoutChildrenId = 122;
        const childLogs = await logService.getChildLogsByParentId(logWithoutChildrenId);

        expect(childLogs).to.be.empty;
    });

    it('Should successfully return correct count when children are not found', async () => {
        const logWithoutChildrenId = 122;
        const expectedAmountOfChildren = 0;
        const childLogs = await logService.getChildLogsByParentId(logWithoutChildrenId);

        expect(childLogs.length).to.equal(expectedAmountOfChildren);
    });

    it('Should successfully return all the logs of a run, with all their relations', async () => {
        const logs = await logService.getAllByRun(1);

        expect(logs.map(({ id }) => id)).to.include(1);
        const log = logs.find(({ id }) => id === 1);
        expect(log.runs).to.deep.equal([{ id: 1, runNumber: 1 }]);
        expect(log.lhcFills.map(({ fillNumber }) => fillNumber)).to.have.members([5, 6]);
        expect(log.environments.map(({ id }) => id)).to.have.members(['8E4aZTjY', 'eZF99lH6']);
        expect(log.dataPasses.map(({ name }) => name)).to.have.members(['LHC22b_apass1', 'LHC22b_skimming']);
        expect(log.simulationPasses.map(({ name }) => name)).to.have.members(['LHC23k6c', 'LHC23k6b']);
        // Complete tags (with their color and archived state) are required to display the logs, the author is only exposed by name
        expect(log.tags).to.not.be.empty;
        expect(log.tags.every(({ archived, updatedAt }) => typeof archived === 'boolean' && typeof updatedAt === 'number')).to.be.true;
        expect(log.author.name).to.be.a('string');
    });

    it('Should successfully return the attachments of logs linked to a run, an LHC fill or an environment', async () => {
        const { id: logId } = await logService.create(
            logMock,
            [1],
            [],
            ['8E4aZTjY'],
            [6],
            [{
                size: 10,
                path: '/tmp/attachment.txt',
                filename: 'attachment.txt',
                originalname: 'attachment.txt',
                mimetype: 'text/plain',
                encoding: '7bit',
            }],
        );

        for (const logs of [
            await logService.getAllByRun(1),
            await logService.getAllByLhcFill(6),
            await logService.getAllByEnvironment('8E4aZTjY'),
        ]) {
            const log = logs.find(({ id }) => id === logId);
            expect(log.attachments.map(({ originalName }) => originalName)).to.deep.equal(['attachment.txt']);
        }
    });
};
