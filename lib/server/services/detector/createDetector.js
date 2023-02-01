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

const { ConflictError } = require('../../errors/ConflictError.js');
const { getDetector } = require('./getDetector.js');
const { DetectorRepository } = require('../../../database/repositories/index.js');

/**
 * Create a detector in the database and return the auto generated id
 *
 * @param {Partial<SequelizeDetector>} detector the detector to create
 * @return {Promise<number>} resolve once the creation is done providing the id of the detector that have been (or will be) created
 */
exports.createDetector = async (detector) => {
    const { name } = detector;

    if (name) {
        const existingDetector = await getDetector({ detectorName: name });
        if (existingDetector) {
            throw new ConflictError(`A detector already exists with name ${name}`);
        }
    }

    const { /** @type {number} id */ id } = await DetectorRepository.insert(detector);
    return id;
};
