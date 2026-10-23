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

const { HostRepository } = require('../../../database/repositories/index.js');

/**
 * Return the ids of the hosts on which a given DPL process has been executed in a given run for a given DPL detector
 *
 * @param {number} runNumber the run number of the run
 * @param {number} detectorId the id of the DPL detector
 * @param {number} processId the id of the DPL process
 * @return {Promise<number[]>} resolves with the ids of the hosts
 */
exports.getHostIdsWithExecutedDplProcess = async (runNumber, detectorId, processId) => {
    const hosts = await HostRepository.findAll({
        include: {
            association: 'processesExecutions',
            where: { runNumber, detectorId, processId },
            required: true,
            attributes: [],
            order: [['name', 'ASC']],
        },
        raw: true,
        attributes: ['id'],
    });

    return hosts.map(({ id }) => id);
};
