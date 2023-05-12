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

const { dplProcessService } = require('../../../../../lib/server/services/dpl/DplProcessService.js');

const assert = require('assert');
const { expect } = require('chai');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    it('should successfully return the list of detectors that have an executed process for a given run', async () => {
        const detectors = await dplProcessService.getAllDetectorsWithExecutedProcessesByRun({ runNumber: 106 });
        expect(detectors.map(({ id }) => id)).to.eql([1, 2]);
        expect(detectors.every(({ processesExecutions }) => processesExecutions.length === 0)).to.be.true;
    });

    it('should throw an error if trying to fetch detectors for a run that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllDetectorsWithExecutedProcessesByRun({ runNumber: 999 }),
            new NotFoundError('Run with this run number (999) could not be found'),
        );
    });

    it('should successfully return the list of processes that have an executed process for a given run and a given detector', async () => {
        const processes = await dplProcessService.getAllExecutedProcessesByRunAndDetector(
            { runNumber: 106 },
            { dplDetectorId: 1 },
        );
        expect(processes.map(({ id }) => id)).to.eql([1, 2, 3]);
        expect(processes.every(({ processesExecutions }) => processesExecutions.length === 0)).to.be.true;
    });

    it('should throw an error if trying to fetch processes for a run that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runNumber: 999 },
                { dplDetectorId: 1 },
            ),
            new NotFoundError('Run with this run number (999) could not be found'),
        );
    });

    it('should throw an error if trying to fetch processes for a DPL detector that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorId: 999 },
            ),
            new NotFoundError('DPL detector with this id (999) could not be found'),
        );
    });

    it('should successfully return the list of hosts that have a given process executed for a given run and a given detector', async () => {
        const hosts = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
            { runNumber: 106 },
            { dplDetectorId: 1 },
            { dplProcessId: 1 },
        );
        expect(hosts.map(({ id }) => id)).to.eql([1, 2]);
        expect(hosts.every(({ processesExecutions }) => processesExecutions.length === 0)).to.be.true;
    });

    it('should throw an error if trying to fetch hosts for a run that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: 999 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
            ),
            new NotFoundError('Run with this run number (999) could not be found'),
        );
    });

    it('should throw an error if trying to fetch hosts for a DPL detector that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorId: 999 },
                { dplProcessId: 1 },
            ),
            new NotFoundError('DPL detector with this id (999) could not be found'),
        );
    });

    it('should throw an error if trying to fetch hosts for a DPL process that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 999 },
            ),
            new NotFoundError('DPL process with this id (999) could not be found'),
        );
    });

    it('should successfully return the list of execution of a given process on a given host for a given run and a given detector', async () => {
        const processesExecutions = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
            { runNumber: 106 },
            { dplDetectorId: 1 },
            { dplProcessId: 1 },
            { hostId: 1 },
        );
        expect(processesExecutions.map(({ id }) => id)).to.eql([2]);
    });

    it('should throw an error if trying to fetch process executions for a run that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 999 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
                { hostId: 1 },
            ),
            new NotFoundError('Run with this run number (999) could not be found'),
        );
    });

    it('should throw an error if trying to fetch process executions for a DPL detector that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorId: 999 },
                { dplProcessId: 1 },
                { hostId: 1 },
            ),
            new NotFoundError('DPL detector with this id (999) could not be found'),
        );
    });

    it('should throw an error if trying to fetch process executions for a DPL process that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 999 },
                { hostId: 1 },
            ),
            new NotFoundError('DPL process with this id (999) could not be found'),
        );
    });

    it('should throw an error if trying to fetch process executions for a host that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
                { hostId: 999 },
            ),
            new NotFoundError('Host with this id (999) could not be found'),
        );
    });
};
