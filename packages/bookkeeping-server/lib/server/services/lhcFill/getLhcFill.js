/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { utilities: { QueryBuilder } } = require('../../../database');
const { LhcFillRepository } = require('../../../database/repositories/index.js');

/**
 * Find and return an LHC fill model by its fill number
 *
 * @param {number} fillNumber the fill number of the fill to fetch
 * @param {function|null} qbConfiguration function called with the fill find query builder as parameter to add specific configuration to
 *     the query
 * @return {Promise<SequelizeLhcFill|null>} the fill found or null
 */
exports.getLhcFill = (fillNumber, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('fillNumber').is(fillNumber);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return LhcFillRepository.findOne(queryBuilder);
};
