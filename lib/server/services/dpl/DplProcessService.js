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

const {
    dplDetectorAdapter,
    dplProcessAdapter,
    dplProcessExecutionAdapter,
    hostAdapter,
} = require('../../../database/adapters/index.js');
const {
    DplDetectorRepository,
    DplProcessRepository,
    HostRepository,
    DplProcessExecutionRepository,
} = require('../../../database/repositories/index.js');
const { getRunOrFail } = require('../run/getRunOrFail.js');
const { getDplDetectorOrFail } = require('./getDplDetectorOrFail.js');
const { getDplProcessOrFail } = require('./getDplProcessOrFail.js');
const { getHostOrFail } = require('../host/getHostOrFail.js');
const { getOrCreateDplProcess } = require('./getOrCreateDplProcess.js');
const { getOrCreateDplDetector } = require('./getOrCreateDplDetector.js');
const { getOrCreateHost } = require('../host/getOrCreateHost.js');
const { createDplProcessExecution } = require('./createDplProcessExecution.js');
const { getOrCreateDplProcessType } = require('./getOrCreateDplProcessType.js');
const { getDplProcessExecution } = require('./getDplProcessExecution.js');

/**
 * DPL service
 */
class DplProcessService {
    /**
     * Returns all the DPL detectors that have at least one executed process in the given run
     *
     * @param {RunIdentifier} runIdentifier the identifier of the run that must have at least one executed process
     * @return {Promise<DplDetector[]>} the resulting DPL detectors
     */
    async getAllDetectorsWithExecutedProcessesByRun(runIdentifier) {
        const run = await getRunOrFail(runIdentifier);

        return (await DplDetectorRepository.findAll({
            include: {
                association: 'processesExecutions',
                where: {
                    runNumber: run.runNumber,
                },
                required: true,
                attributes: [],
            },
        })).map(dplDetectorAdapter.toEntity);
    }

    /**
     * Returns the list of all DPL processes that have been executed at least once for the given run and detector
     *
     * @param {RunIdentifier} runIdentifier the identifier of the run for which the process must have been executed
     * @param {DplDetectorIdentifier} detectorIdentifier the identifier of the detector for which the process must have been executed
     * @return {Promise<DplProcess[]>} the processes that match the criteria
     */
    async getAllExecutedProcessesByRunAndDetector(runIdentifier, detectorIdentifier) {
        const run = await getRunOrFail(runIdentifier);
        const detector = await getDplDetectorOrFail(detectorIdentifier);

        return (await DplProcessRepository.findAll({
            include: {
                association: 'processesExecutions',
                where: {
                    runNumber: run.runNumber,
                    detectorId: detector.id,
                },
                required: true,
                attributes: [],
            },
        })).map(dplProcessAdapter.toEntity);
    }

    /**
     * Returns the list of all hosts on which a given process has been executed for the given run and detector
     *
     * @param {RunIdentifier} runIdentifier the identifier of the run for which the process must have been executed
     * @param {DplDetectorIdentifier} detectorIdentifier the identifier of the detector for which the process must have been executed
     * @param {DplProcessIdentifier} processIdentifier the identifier of the process that must have been executed
     * @return {Promise<Host[]>} the hosts that match the criteria
     */
    async getAllHostWithExecutedProcessByRunAndDetector(runIdentifier, detectorIdentifier, processIdentifier) {
        const run = await getRunOrFail(runIdentifier);
        const detector = await getDplDetectorOrFail(detectorIdentifier);
        const process = await getDplProcessOrFail(processIdentifier);

        return (await HostRepository.findAll({
            include: {
                association: 'processesExecutions',
                where: {
                    runNumber: run.runNumber,
                    detectorId: detector.id,
                    processId: process.id,
                },
                required: true,
                attributes: [],
            },
        })).map(hostAdapter.toEntity);
    }

    /**
     * Returns the list of executions of a given process, on a given host, for a given run and detector
     *
     * @param {RunIdentifier} runIdentifier the identifier of the run for which the process must have been executed
     * @param {DplDetectorIdentifier} detectorIdentifier the identifier of the detector for which the process must have been executed
     * @param {DplProcessIdentifier} processIdentifier the identifier of the process that must have been executed
     * @param {HostIdentifier} hostIdentifier the identifier of the host on which the process must have been executed
     * @return {Promise<DplProcessExecution[]>} the process executions
     */
    async getAllProcessExecutionByRunAndDetectorAndHost(runIdentifier, detectorIdentifier, processIdentifier, hostIdentifier) {
        const [run, detector, process, host] = await Promise.all([
            getRunOrFail(runIdentifier),
            getDplDetectorOrFail(detectorIdentifier),
            getDplProcessOrFail(processIdentifier),
            getHostOrFail(hostIdentifier),
        ]);

        return (await DplProcessExecutionRepository.findAll({
            where: {
                runNumber: run.runNumber,
                detectorId: detector.id,
                processId: process.id,
                hostId: host.id,
            },
        })).map(dplProcessExecutionAdapter.toEntity);
    }

    /**
     * Create a new instance of process execution
     *
     * @param {{arguments: (string|undefined)}} newProcessExecution the process execution to create
     * @param {{runIdentifier: RunIdentifier, detectorName: string, processTypeLabel: string, processName: string, hostname: string}} relations
     *     the relations of the process execution to create
     * @return {Promise<DplProcessExecution>} the created process execution
     */
    async createProcessExecution(newProcessExecution, relations) {
        // Create required relation
        const [run, detector, process, host] = await Promise.all([
            getRunOrFail(relations.runIdentifier),
            getOrCreateDplDetector({ dplDetectorName: relations.detectorName }),
            (async () => {
                const dplProcessType = await getOrCreateDplProcessType({ dplProcessTypeLabel: relations.processTypeLabel });
                return getOrCreateDplProcess({ dplProcessName: relations.processName, dplProcessTypeId: dplProcessType.id });
            })(),
            getOrCreateHost({ hostname: relations.hostname }),
        ]);

        // Create the process execution itself
        const id = await createDplProcessExecution({
            ...newProcessExecution,
            runNumber: run.runNumber,
            detectorId: detector.id,
            processId: process.id,
            hostId: host.id,
        });

        const processExecution = await getDplProcessExecution(id);

        return processExecution ? dplProcessExecutionAdapter.toEntity(processExecution) : processExecution;
    }
}

exports.dplProcessService = new DplProcessService();
