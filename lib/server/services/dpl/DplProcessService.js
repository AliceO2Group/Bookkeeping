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

/**
 * DPL service
 */
class DplProcessService {
    /**
     * Returns all the dpl detectors that have at least one executed process in the given run
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
     * @param {number} detectorId the identifier of the detector for which the process must have been executed
     * @return {Promise<DplProcess[]>} the processes that match the criteria
     */
    async getAllExecutedProcessesByRunAndDetector(runIdentifier, detectorId) {
        const run = await getRunOrFail(runIdentifier);
        const detector = await getDplDetectorOrFail(detectorId);

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
     * @param {number} detectorId the identifier of the detector for which the process must have been executed
     * @param {number} processId the identifier of the process that must have been executed
     * @return {Promise<Host[]>} the hosts that match the criteria
     */
    async getAllHostWithExecutedProcessByRunAndDetector(runIdentifier, detectorId, processId) {
        const run = await getRunOrFail(runIdentifier);
        const detector = await getDplDetectorOrFail(detectorId);
        const process = await getDplProcessOrFail(processId);

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
     * @param {number} detectorId the identifier of the detector for which the process must have been executed
     * @param {number} processId the identifier of the process that must have been executed
     * @param {number} hostId the identifier of the host on which the process must have been executed
     * @return {Promise<DplProcessExecution[]>} the process executions
     */
    async getAllProcessExecutionByRunAndDetectorAndHost(runIdentifier, detectorId, processId, hostId) {
        const [run, detector, process, host] = await Promise.all([
            getRunOrFail(runIdentifier),
            getDplDetectorOrFail(detectorId),
            getDplProcessOrFail(processId),
            getHostOrFail(hostId),
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
}

exports.dplProcessService = new DplProcessService();
