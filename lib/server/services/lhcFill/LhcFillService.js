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
const { getLastLhcFill } = require('./getLastLhcFill.js');
const { repositories: { LhcFillRepository } } = require('../../../database');
const { Op } = require('sequelize');

/**
 * Global service to handle LHC fill
 */
class LhcFillService {
    /**
     * Find and return the most recent LHC fill
     *
     * @return {Promise<LhcFill|null>} the found LHC fill or null
     */
    async getLast() {
        const lhcFill = await getLastLhcFill();
        return lhcFill ? lhcFillAdapter.toEntity(lhcFill) : null;
    }

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
     * Return the list of LHC fills that ended in the given period
     *
     * @param {Period} period the period in which LHC fills should have ended
     * @return {Promise<LhcFill[]>} the list of fills in the period
     */
    async getAllEndedInPeriod(period) {
        const fillNumbers = await LhcFillRepository.getFillNumbersEndedInPeriods(period);
        const lhcFills = await LhcFillRepository.findAll({
            where: { fillNumber: { [Op.in]: fillNumbers } },
            include: { association: 'statistics' },
        });
        return lhcFills.map(lhcFillAdapter.toEntity);
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
                include: [
                    'tags',
                    'lhcFill',
                    'detectors',
                    {
                        association: 'eorReasons',
                        include: {
                            association: 'reasonType',
                            attributes: ['category', 'title'],
                        },
                    },
                ],
            });
            queryBuilder.orderBy('runNumber', 'ASC', 'runs');
        }
    }
}

exports.LhcFillService = LhcFillService;

exports.lhcFillService = new LhcFillService();
