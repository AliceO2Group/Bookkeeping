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
const { GaqDetectorRepository } = require('../../../database/repositories/index.js');

/**
 * Remove all the GAQ (global aggregated quality) detectors entries of the given runs for a data pass
 *
 * @param {number} dataPassId the id of the data pass
 * @param {number[]} runNumbers the run numbers of the runs for which entries must be removed
 * @return {Promise<void>} resolves once the entries have been removed
 */
exports.removeGaqDetectors = async (dataPassId, runNumbers) => {
    await GaqDetectorRepository.removeAll({
        where: {
            dataPassId,
            runNumber: { [Op.in]: runNumbers },
        },
    });
};
