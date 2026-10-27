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
const { getRunOrFail } = require('../run/getRunOrFail.js');
const { getDplDetectorOrFail } = require('./getDplDetectorOrFail.js');
const { getDplProcessOrFail } = require('./getDplProcessOrFail.js');
const { getHostOrFail } = require('../host/getHostOrFail.js');
const { getOrCreateDplProcessByNameAndTypeId } = require('./getOrCreateDplProcess.js');
const { getOrCreateDplDetectorByName } = require('./getOrCreateDplDetector.js');
const { getOrCreateHostByHostname } = require('../host/getOrCreateHost.js');
const { createDplProcessExecution } = require('./createDplProcessExecution.js');
const { getOrCreateDplProcessTypeByLabel } = require('./getOrCreateDplProcessType.js');
const { getDplProcessExecution } = require('./getDplProcessExecution.js');
const { getAllDplDetectors } = require('./getAllDplDetectors.js');
const { getAllDplProcessExecutions } = require('./getAllDplProcessExecutions.js');
const { getAllDplProcesses } = require('./getAllDplProcesses.js');
const { getAllHosts } = require('../host/getAllHosts.js');
const { getDplDetectorIdsWithExecutedProcessesInRun } = require('./getDplDetectorIdsWithExecutedProcessesInRun.js');
const { getDplProcessIdsExecutedInRunByDetector } = require('./getDplProcessIdsExecutedInRunByDetector.js');
const { getHostIdsWithExecutedDplProcess } = require('./getHostIdsWithExecutedDplProcess.js');
const { cacheAsyncFunction } = require('../../../utilities/cacheAsyncFunction.js');

const cachedGetRunOrFail = cacheAsyncFunction((runIdentifier) => getRunOrFail(runIdentifier)
    .then(({ runNumber }) => runNumber));

const cachedGetOrCreateDplDetectorByName = cacheAsyncFunction((detectorName) => getOrCreateDplDetectorByName(detectorName)
    .then(({ id }) => id));

const cachedGetOrCreateDplProcessByNameAndTypeId = cacheAsyncFunction(async (processName, processTypeLabel) => {
    const dplProcessType = await getOrCreateDplProcessTypeByLabel(processTypeLabel);
    const dplProcess = await getOrCreateDplProcessByNameAndTypeId(processName, dplProcessType.id);
    return dplProcess.id;
});

const cachedGetOrCreateHostByHostname = cacheAsyncFunction((hostname) => getOrCreateHostByHostname(hostname)
    .then(({ id }) => id));

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

        // Do the requests in two steps because some tests randomly fail, maybe because of a bug in sequelize?
        const detectorIds = await getDplDetectorIdsWithExecutedProcessesInRun(run.runNumber);

        const sortedDetectors = await getAllDplDetectors((queryBuilder) => {
            queryBuilder.where('id').oneOf(...detectorIds);
            queryBuilder.orderBy('name', 'ASC');
        });

        return sortedDetectors.map(dplDetectorAdapter.toEntity);
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

        // Do the requests in two steps because some tests randomly fail, maybe because of a bug in sequelize?
        const processIds = await getDplProcessIdsExecutedInRunByDetector(run.runNumber, detector.id);

        const sortedProcesses = await getAllDplProcesses((queryBuilder) => {
            queryBuilder.where('id').oneOf(...processIds);
            queryBuilder.include({ association: 'type' });
            queryBuilder.orderBy('name', 'ASC');
        });

        return sortedProcesses.map(dplProcessAdapter.toEntity);
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

        // Do the requests in two steps because some tests randomly fail, maybe because of a bug in sequelize?
        const hostIds = await getHostIdsWithExecutedDplProcess(run.runNumber, detector.id, process.id);

        const sortedHosts = await getAllHosts((queryBuilder) => {
            queryBuilder.where('id').oneOf(...hostIds);
            queryBuilder.orderBy('hostname', 'ASC');
        });

        return sortedHosts.map(hostAdapter.toEntity);
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

        const processExecutions = await getAllDplProcessExecutions((queryBuilder) => {
            queryBuilder.where('runNumber').is(run.runNumber);
            queryBuilder.where('detectorId').is(detector.id);
            queryBuilder.where('processId').is(process.id);
            queryBuilder.where('hostId').is(host.id);
        });

        return processExecutions.map(dplProcessExecutionAdapter.toEntity);
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
        const [runNumber, detectorId, processId, hostId] = await Promise.all([
            cachedGetRunOrFail(relations.runIdentifier),
            cachedGetOrCreateDplDetectorByName(relations.detectorName),
            cachedGetOrCreateDplProcessByNameAndTypeId(relations.processName, relations.processTypeLabel),
            cachedGetOrCreateHostByHostname(relations.hostname),
        ]);

        // Create the process execution itself
        const id = await createDplProcessExecution({
            ...newProcessExecution,
            runNumber,
            detectorId,
            processId,
            hostId,
        });

        const processExecution = await getDplProcessExecution(id);

        return processExecution ? dplProcessExecutionAdapter.toEntity(processExecution) : processExecution;
    }
}

exports.dplProcessService = new DplProcessService();
