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
 * Find the given runs with, as detectors, the ones that are in the list of the default GAQ detectors of the PDP beam type of the run
 *
 * @param {number[]} runNumbers the run numbers of the runs to find
 * @param {Object<string, string[]>} defaultDetectorsNamesByPdpBeamType for each PDP beam type, the names of its default GAQ detectors. Runs of
 *     another PDP beam type are not returned
 * @return {Promise<SequelizeRun[]>} resolves with the runs found, each with its default GAQ `detectors`
 */
exports.getRunsWithDefaultGaqDetectors = (runNumbers, defaultDetectorsNamesByPdpBeamType) => RunRepository.findAll({
    where: { runNumber: { [Op.in]: runNumbers } },
    include: [
        {
            association: 'detectors',
            where: {
                [Op.or]: Object.entries(defaultDetectorsNamesByPdpBeamType).map(([pdpBeamType, detectorsNames]) => ({
                    '$Run.pdp_beam_type$': pdpBeamType,
                    name: { [Op.in]: detectorsNames },
                })),
            },
        },
    ],
});
