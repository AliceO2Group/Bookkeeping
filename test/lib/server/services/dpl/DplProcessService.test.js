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
const { getDplDetectorOrFail } = require('../../../../../lib/server/services/dpl/getDplDetectorOrFail.js');
const { getDplProcessOrFail } = require('../../../../../lib/server/services/dpl/getDplProcessOrFail.js');
const { getDplProcessType } = require('../../../../../lib/server/services/dpl/getDplProcessType.js');
const { getHostOrFail } = require('../../../../../lib/server/services/host/getHostOrFail.js');

module.exports = () => {
    it('should successfully return the list of detectors that have an executed process for a given run', async () => {
        {
            const detectors = await dplProcessService.getAllDetectorsWithExecutedProcessesByRun({ runNumber: 106 });
            expect(detectors.map(({ id }) => id)).to.eql([1, 2]);
        }
        {
            const detectors = await dplProcessService.getAllDetectorsWithExecutedProcessesByRun({ runId: 106 });
            expect(detectors.map(({ id }) => id)).to.eql([1, 2]);
        }
    });

    it('should throw an error if trying to fetch detectors for a run that does not exist', async () => {
        await assert.rejects(
            () => dplProcessService.getAllDetectorsWithExecutedProcessesByRun({ runNumber: 999 }),
            new NotFoundError('Run with this run number (999) could not be found'),
        );
    });

    it('should successfully return the list of processes that have an executed process for a given run and a given detector', async () => {
        {
            const processes = await dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorId: 1 },
            );
            expect(processes.map(({ id }) => id)).to.eql([1, 2, 3]);
        }
        {
            const processes = await dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runId: 106 },
                { dplDetectorId: 1 },
            );
            expect(processes.map(({ id }) => id)).to.eql([1, 2, 3]);
        }
        {
            const processes = await dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorName: 'CPV' },
            );
            expect(processes.map(({ id }) => id)).to.eql([1, 2, 3]);
        }
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
        {
            const hosts = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
            );
            expect(hosts.map(({ id }) => id)).to.eql([1, 2]);
        }
        {
            const hosts = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runId: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
            );
            expect(hosts.map(({ id }) => id)).to.eql([1, 2]);
        }
        {
            const hosts = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorName: 'CPV' },
                { dplProcessId: 1 },
            );
            expect(hosts.map(({ id }) => id)).to.eql([1, 2]);
        }
        {
            const hosts = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessName: 'PROCESS-1', dplProcessTypeId: 1 },
            );
            expect(hosts.map(({ id }) => id)).to.eql([1, 2]);
        }
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
        {
            const processesExecutions = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
                { hostId: 1 },
            );
            expect(processesExecutions.map(({ id }) => id)).to.eql([2]);
        }
        {
            const processesExecutions = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runId: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
                { hostId: 1 },
            );
            expect(processesExecutions.map(({ id }) => id)).to.eql([2]);
        }
        {
            const processesExecutions = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorName: 'CPV' },
                { dplProcessId: 1 },
                { hostId: 1 },
            );
            expect(processesExecutions.map(({ id }) => id)).to.eql([2]);
        }
        {
            const processesExecutions = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessName: 'PROCESS-1', dplProcessTypeId: 1 },
                { hostId: 1 },
            );
            expect(processesExecutions.map(({ id }) => id)).to.eql([2]);
        }
        {
            const processesExecutions = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: 106 },
                { dplDetectorId: 1 },
                { dplProcessId: 1 },
                { hostname: 'FLP-1' },
            );
            expect(processesExecutions.map(({ id }) => id)).to.eql([2]);
        }
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

    it('should successfully create a new process execution and create missing relations if needed', async () => {
        const runNumber = 104;
        const processName = 'PROCESS-1';
        const processTypeLabel = 'QcTask';
        const detectorName = 'CPV';
        const hostname = 'FLP-1';

        {
            const processExecution = await dplProcessService.createProcessExecution(
                { args: '-v -c config.yml' },
                {
                    runIdentifier: { runNumber },
                    processName,
                    detectorName,
                    processTypeLabel,
                    hostname,
                },
            );
            expect(processExecution).to.be.an('object');
            expect(processExecution.detectorId).to.equal(1);
            expect(processExecution.processId).to.equal(1);
            expect(processExecution.hostId).to.equal(1);
        }

        {
            const processExecution = await dplProcessService.createProcessExecution(
                { args: '-v -c config.yml' },
                {
                    runIdentifier: { runNumber },
                    processName,
                    detectorName: 'NON-EXISTING-DETECTOR',
                    processTypeLabel,
                    hostname,
                },
            );
            expect(processExecution).to.not.be.null;
            expect(processExecution.detectorId).to.equal(21);
            const { name } = await getDplDetectorOrFail({ dplDetectorId: 21 });
            expect(name).to.equal('NON-EXISTING-DETECTOR');
            expect(processExecution.processId).to.equal(1);
            expect(processExecution.hostId).to.equal(1);
        }

        {
            const processExecution = await dplProcessService.createProcessExecution(
                { args: '-v -c config.yml' },
                {
                    runIdentifier: { runNumber },
                    detectorName,
                    processName: 'NON-EXISTING-PROCESS',
                    processTypeLabel,
                    hostname,
                },
            );
            expect(processExecution).to.not.be.null;
            expect(processExecution.detectorId).to.equal(1);
            expect(processExecution.processId).to.equal(4);
            const { name, typeId } = await getDplProcessOrFail({ dplProcessId: 4 });
            expect(name).to.equal('NON-EXISTING-PROCESS');
            expect(typeId).to.equal(1);
            expect(processExecution.hostId).to.equal(1);
        }

        {
            const processExecution = await dplProcessService.createProcessExecution(
                { args: '-v -c config.yml' },
                {
                    runIdentifier: { runNumber },
                    processName,
                    detectorName,
                    processTypeLabel: 'NON-EXISTING-PROCESS-TYPE',
                    hostname,
                },
            );
            expect(processExecution).to.not.be.null;
            expect(processExecution.detectorId).to.equal(1);
            expect(processExecution.processId).to.equal(5);
            const { name, typeId } = await getDplProcessOrFail({ dplProcessId: 5 });
            expect(name).to.equal(processName);
            expect(typeId).to.equal(7);
            const type = await getDplProcessType({ dplProcessTypeId: 7 });
            expect(type).to.not.be.null;
            expect(type.label).to.equal('NON-EXISTING-PROCESS-TYPE');
            expect(processExecution.hostId).to.equal(1);
        }

        {
            const processExecution = await dplProcessService.createProcessExecution(
                { args: '-v -c config.yml' },
                {
                    runIdentifier: { runNumber },
                    processName,
                    detectorName,
                    processTypeLabel,
                    hostname: 'NON-EXISTING-HOSTNAME',
                },
            );
            expect(processExecution).to.not.be.null;
            expect(processExecution.detectorId).to.equal(1);
            expect(processExecution.processId).to.equal(1);
            expect(processExecution.hostId).to.equal(4);
            const { hostname } = await getHostOrFail({ hostId: 4 });
            expect(hostname).to.equal('NON-EXISTING-HOSTNAME');
        }
    });

    it('should throw an error when trying to create a process execution for a non-existing run', async () => {
        await assert.rejects(
            () => dplProcessService.createProcessExecution(
                {},
                {
                    runIdentifier: { runNumber: 999 },
                    detectorName: 'Any',
                    processName: 'Any',
                    processTypeLabel: 'Any',
                    hostname: 'Any',
                },
            ),
            new NotFoundError('Run with this run number (999) could not be found'),
        );
    });
};
