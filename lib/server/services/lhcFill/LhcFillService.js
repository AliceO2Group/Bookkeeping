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

/**
 * @typedef LhcFillRelationsToInclude object specifying which run relations should be fetched alongside the fill
 * @property {boolean} [runs] if true, related runs will be fetched alongside the fill
 */

const { getLhcFill } = require('./getLhcFill.js');
const { lhcFillAdapter } = require('../../../database/adapters/index.js');

/**
 * Global service to handle LHC fill
 */
class LhcFillService {
    /**
     * Find and return a fill for a given fill number
     *
     * @param {number} fillNumber the fill number of the fill to find
     * @param {LhcFillRelationsToInclude} [relations] the relations to include
     * @return {Promise<LhcFill|null>} the found LHC fill or null
     */
    async get(fillNumber, relations) {
        const lhcFill = await getLhcFill(fillNumber, (queryBuilder) => this._getLhcFillQbConfiguration(queryBuilder, relations));
        return lhcFill ? lhcFillAdapter.toEntity(lhcFill) : null;
    }

    /**
     * Configure the given query builder to include the provided relations
     *
     * @param {QueryBuilder} queryBuilder the query builder to complete for relations
     * @param {LhcFillRelationsToInclude} [relations] the relations to include
     * @return {void}
     * @private
     */
    _getLhcFillQbConfiguration(queryBuilder, relations) {
        relations = relations || {};
        if (relations.runs) {
            queryBuilder.include({
                association: 'runs',
                include: ['tags', 'lhcFill', 'detectors'],
            });
        }
    }
}

exports.LhcFillService = LhcFillService;

exports.lhcFillService = new LhcFillService();
