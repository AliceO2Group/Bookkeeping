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
 * Find the given runs with their detectors (name only) restricted to the ones of the given ids
 *
 * @param {number[]} runNumbers the run numbers of the runs to find
 * @param {number[]} detectorIds the ids of the detectors to include, the other detectors of the runs are ignored
 * @return {Promise<SequelizeRun[]>} resolves with the runs found, each with its `detectors` (an empty list if it has none of the given ones)
 */
exports.getRunsWithDetectorsByIds = (runNumbers, detectorIds) => RunRepository.findAll({
    attributes: ['runNumber'],
    where: { runNumber: { [Op.in]: runNumbers } },
    include: [
        {
            association: 'detectors',
            attributes: ['name'],
            where: { id: { [Op.in]: detectorIds } },
            through: { attributes: [] },
            required: false,
        },
    ],
});
