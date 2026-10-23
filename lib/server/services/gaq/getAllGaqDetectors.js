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

const { dataSource } = require('../../../database/DataSource.js');
const { GaqDetectorRepository } = require('../../../database/repositories/index.js');

/**
 * Find and return the GAQ (global aggregated quality) detectors entries
 *
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the GAQ detectors find query builder as parameter to
 *     add specific configuration to the query
 * @return {Promise<SequelizeGaqDetector[]>} resolves with the GAQ detectors entries found
 */
exports.getAllGaqDetectors = (qbConfiguration = null) => {
    const queryBuilder = dataSource.createQueryBuilder();

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return GaqDetectorRepository.findAll(queryBuilder);
};
