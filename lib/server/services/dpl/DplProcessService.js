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

const { dplDetectorAdapter } = require('../../../database/adapters/index.js');
const { DplDetectorRepository } = require('../../../database/repositories/index.js');
const { getRunOrFail } = require('../run/getRunOrFail.js');

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
}

exports.dplProcessService = new DplProcessService();
