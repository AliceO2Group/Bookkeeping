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

const { DplDetectorRepository } = require('../../../database/repositories/index.js');

/**
 * Return the ids of the DPL detectors that have at least one executed process in a given run, sorted by detector name
 *
 * @param {number} runNumber the run number of the run
 * @return {Promise<number[]>} resolves with the ids of the DPL detectors
 */
exports.getDplDetectorIdsWithExecutedProcessesInRun = async (runNumber) => {
    const detectors = await DplDetectorRepository.findAll({
        include: {
            association: 'processesExecutions',
            where: { runNumber },
            required: true,
            attributes: [],
        },
        raw: true,
        attributes: ['id'],
        order: [['name', 'ASC']],
    });

    return detectors.map(({ id }) => id);
};
