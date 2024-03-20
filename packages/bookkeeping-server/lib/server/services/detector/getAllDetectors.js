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

const { repositories: { DetectorRepository } } = require('../../../database');
const { utilities: { QueryBuilder } } = require('../../../database');

/**
 * Return the list of all the available detectors
 *
 * @param {function|null} qbConfiguration function called with the detectors query builder as parameter to add specific configuration to the
 *     query
 * @returns {Promise<SequelizeDetector[]>} Promise resolving with the list of detectors
 */
exports.getAllDetectors = (qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();
    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return DetectorRepository.findAll(queryBuilder);
};
