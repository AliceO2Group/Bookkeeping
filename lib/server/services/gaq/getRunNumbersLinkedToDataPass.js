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

const { Op } = require('sequelize');
const { RunRepository } = require('../../../database/repositories/index.js');

/**
 * Return, among the given run numbers, the ones of the runs linked to a data pass
 *
 * @param {number} dataPassId the id of the data pass
 * @param {number[]} runNumbers the run numbers to check
 * @return {Promise<number[]>} resolves with the run numbers of the runs linked to the data pass
 */
exports.getRunNumbersLinkedToDataPass = async (dataPassId, runNumbers) => {
    const runs = await RunRepository.findAll({
        attributes: ['runNumber'],
        where: { runNumber: { [Op.in]: runNumbers } },
        include: [{ association: 'dataPass', where: { id: dataPassId }, required: true }],
    });

    return runs.map(({ runNumber }) => runNumber);
};
