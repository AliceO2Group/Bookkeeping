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

const { DplProcessRepository } = require('../../../database/repositories/index.js');

/**
 * Return the ids of the DPL processes that have been executed at least once in a given run for a given DPL detector, sorted by process name
 *
 * @param {number} runNumber the run number of the run
 * @param {number} detectorId the id of the DPL detector
 * @return {Promise<number[]>} resolves with the ids of the DPL processes
 */
exports.getDplProcessIdsExecutedInRunByDetector = async (runNumber, detectorId) => {
    const processes = await DplProcessRepository.findAll({
        include: {
            association: 'processesExecutions',
            where: { runNumber, detectorId },
            required: true,
            attributes: [],
        },
        raw: true,
        attributes: ['id'],
        order: [['name', 'ASC']],
    });

    return processes.map(({ id }) => id);
};
